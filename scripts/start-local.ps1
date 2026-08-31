[CmdletBinding()]
param(
  [switch]$Initialize,
  [switch]$Reset,
  [switch]$Status,
  [string]$ConfigPath = (Join-Path $PSScriptRoot '..\supabase\config.toml'),
  [string]$DockerExecutable = 'docker',
  [string]$SupabaseExecutable = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Stop-WithMessage([string]$Message, [int]$Code) {
  Write-Error $Message -ErrorAction Continue
  exit $Code
}

function Get-ConfigValue([string]$Section, [string]$Key) {
  $activeSection = ''
  foreach ($line in Get-Content -LiteralPath $ConfigPath) {
    if ($line -match '^\s*\[([^]]+)\]\s*$') {
      $activeSection = $Matches[1]
      continue
    }
    $keyPattern = '^\s*{0}\s*=\s*"?([^"#]+)"?' -f [regex]::Escape($Key)
    if ($activeSection -eq $Section -and $line -match $keyPattern) {
      return $Matches[1].Trim()
    }
  }
  return $null
}

function Resolve-SupabaseCli {
  if ($SupabaseExecutable) {
    if (Test-Path -LiteralPath $SupabaseExecutable) { return (Resolve-Path $SupabaseExecutable).Path }
    Stop-WithMessage "Supabase CLI not found at '$SupabaseExecutable'." 12
  }

  $command = Get-Command supabase -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $cliRoot = Join-Path $env:LOCALAPPDATA 'pnpm\store\v11\links\@supabase\cli-windows-x64'
  if (Test-Path -LiteralPath $cliRoot) {
    $candidate = Get-ChildItem -LiteralPath $cliRoot -Recurse -Filter supabase.exe -ErrorAction SilentlyContinue |
      Sort-Object FullName -Descending |
      Select-Object -First 1
    if ($candidate) { return $candidate.FullName }
  }

  Stop-WithMessage 'Supabase CLI is unavailable. Install it or pass -SupabaseExecutable <path>.' 12
}

function Get-StackContainers([string]$ProjectId) {
  $lines = & $DockerExecutable --context default ps -a --format '{{.Names}}|{{.Status}}|{{.Ports}}'
  return @($lines | Where-Object { $_ -match "^supabase_.+_$([regex]::Escape($ProjectId))\|" })
}

function Get-StackPortMappings([string]$ProjectId) {
  $lines = & $DockerExecutable --context default ps --format '{{.Names}}|{{.Ports}}'
  return ($lines | Where-Object { $_ -match "^supabase_.+_$([regex]::Escape($ProjectId))\|" }) -join "`n"
}

function Test-PortListener([int]$Port) {
  return $null -ne (Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1)
}

function Test-Http([string]$Name, [string]$Uri) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method Get -TimeoutSec 8
    Write-Host "[OK] $Name $Uri ($($response.StatusCode))"
    return $true
  } catch {
    Write-Host "[FAIL] $Name $Uri ($($_.Exception.Message))"
    return $false
  }
}

if (($Initialize -and $Reset) -or ($Status -and ($Initialize -or $Reset))) {
  Stop-WithMessage 'Use exactly one mode: default, -Status, -Initialize, or -Reset.' 10
}
if (-not (Test-Path -LiteralPath $ConfigPath)) {
  Stop-WithMessage "Supabase config not found: $ConfigPath" 11
}

try {
  $dockerVersion = & $DockerExecutable --context default version --format '{{.Server.Version}}' 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $dockerVersion) { throw 'Docker Server did not respond.' }
  Write-Host "[OK] Docker Engine $dockerVersion"
} catch {
  Stop-WithMessage "Docker Desktop is unavailable. Start Docker Desktop, wait for the engine, then rerun this script. Detail: $($_.Exception.Message)" 20
}

$cli = Resolve-SupabaseCli
$cliVersion = & $cli --version
if ($LASTEXITCODE -ne 0) { Stop-WithMessage 'Supabase CLI could not execute.' 12 }
Write-Host "[OK] Supabase CLI $cliVersion"

$projectMatch = Get-Content -LiteralPath $ConfigPath | Select-String '^\s*project_id\s*=\s*"([^"]+)"' | Select-Object -First 1
$projectId = if ($projectMatch) { $projectMatch.Matches.Groups[1].Value } else { '' }
if (-not $projectId) { Stop-WithMessage 'project_id is missing from config.toml.' 11 }

$ports = [ordered]@{
  API = [int](Get-ConfigValue 'api' 'port')
  DB = [int](Get-ConfigValue 'db' 'port')
  Analytics = [int](Get-ConfigValue 'analytics' 'port')
  Studio = [int](Get-ConfigValue 'studio' 'port')
  ShadowReserved = [int](Get-ConfigValue 'db' 'shadow_port')
  Mail = [int](Get-ConfigValue 'inbucket' 'port')
}
$expectedUrl = "http://127.0.0.1:$($ports.API)"
$envPath = Join-Path $projectRoot '.env.local'
if (-not (Test-Path -LiteralPath $envPath)) {
  Stop-WithMessage ".env.local is missing. Create it with VITE_SUPABASE_URL=$expectedUrl; this script will not write secrets." 31
}
$envMatch = Get-Content -LiteralPath $envPath | Select-String '^VITE_SUPABASE_URL=(.+)$' | Select-Object -First 1
$configuredUrl = if ($envMatch) { $envMatch.Matches.Groups[1].Value.TrimEnd('/') } else { '' }
if ($configuredUrl -ne $expectedUrl) {
  Stop-WithMessage ".env.local URL mismatch: expected '$expectedUrl', found '$configuredUrl'. Fix it manually; no file was changed." 31
}
Write-Host "[OK] .env.local URL matches $expectedUrl"

$volumeName = "supabase_db_$projectId"
$volumes = @(& $DockerExecutable --context default volume ls --format '{{.Name}}')
$volumeExists = $volumes -contains $volumeName
$containers = @(Get-StackContainers $projectId)
$stackMappings = Get-StackPortMappings $projectId

foreach ($entry in $ports.GetEnumerator()) {
  $port = $entry.Value
  $listening = Test-PortListener $port
  $ownedByStack = $stackMappings -match ":$port->"
  if ($listening -and -not $ownedByStack) {
    Stop-WithMessage "Port $port ($($entry.Key)) is occupied by another process. Stop that process or change supabase/config.toml." 30
  }
  $state = if ($listening) { 'listening' } else { 'free' }
  if ($entry.Key -eq 'ShadowReserved') { $state += ' (reserved; listener is only expected during shadow DB work)' }
  Write-Host "[INFO] $($entry.Key) port ${port}: $state"
}

if (-not $volumeExists) {
  if (-not $Initialize) {
    Stop-WithMessage "Local database volume '$volumeName' is missing. Data cannot be resumed. Run '.\scripts\start-local.ps1 -Initialize' only if a new local database is intended." 40
  }
  if ($containers.Count -gt 0) {
    Stop-WithMessage "Volume '$volumeName' is missing but project containers exist. Inspect Docker state manually before initialization." 41
  }
  Write-Host '[INIT] Creating a new local-only stack and replaying migrations/seed.'
  Push-Location $projectRoot
  try { $null = & $cli start 2>&1 } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { Stop-WithMessage 'Supabase initialization failed. Review the CLI output above.' 50 }
} elseif ($Reset) {
  $confirmation = Read-Host "Type RESET LOCAL DATABASE to erase '$volumeName' and replay migrations/seed"
  if ($confirmation -cne 'RESET LOCAL DATABASE') {
    Stop-WithMessage 'Reset cancelled; confirmation text did not match. No reset was executed.' 60
  }
  Push-Location $projectRoot
  try { & $cli db reset --local } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { Stop-WithMessage 'Local database reset failed.' 61 }
} elseif (-not $Status) {
  Write-Host "[START] Reusing existing volume '$volumeName'; no reset will be performed."
  Push-Location $projectRoot
  try { $null = & $cli start 2>&1 } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { Stop-WithMessage 'Supabase start failed. Existing data was not reset by this script.' 51 }
}

$containers = @(Get-StackContainers $projectId)
if ($containers.Count -eq 0) {
  if ($volumeExists) {
    Stop-WithMessage "The local stack is stopped, but volume '$volumeName' still exists. Run '.\scripts\start-local.ps1' to resume it without reset." 43
  }
  Stop-WithMessage "No containers or database volume exist for project '$projectId'. Use -Initialize only when creating a new local stack is intended." 42
}

$requiredHealthy = @('db', 'studio', 'pg_meta', 'rest', 'realtime', 'inbucket', 'auth', 'kong', 'analytics')
$unhealthy = @()
foreach ($service in $requiredHealthy) {
  $name = "supabase_${service}_$projectId"
  $line = $containers | Where-Object { $_ -like "$name|*" } | Select-Object -First 1
  $running = $line -and (($line -split '\|')[1] -like 'Up*')
  $healthSatisfied = $service -eq 'rest' -or $line -match '\(healthy\)'
  if (-not $running -or -not $healthSatisfied) { $unhealthy += $name }
}
if ($unhealthy.Count -gt 0) {
  Stop-WithMessage "Containers missing or unhealthy: $($unhealthy -join ', '). Wait and rerun -Status; inspect with 'docker ps -a' if persistent." 70
}
Write-Host '[OK] Required Supabase containers are healthy.'

$containerWarnings = $containers | Where-Object { $_ -match '\|(Restarting|Exited|Created)' }
foreach ($warning in $containerWarnings) {
  Write-Warning "Non-required container state: $warning"
}

$healthOk = $true
$healthOk = (Test-Http 'Auth' "$expectedUrl/auth/v1/health") -and $healthOk
$healthOk = (Test-Http 'API gateway' "$expectedUrl/rest/v1/") -and $healthOk
$healthOk = (Test-Http 'Studio' "http://127.0.0.1:$($ports.Studio)") -and $healthOk
$healthOk = (Test-Http 'Mail' "http://127.0.0.1:$($ports.Mail)") -and $healthOk

& $DockerExecutable exec "supabase_db_$projectId" pg_isready -U postgres -d postgres | Out-Host
if ($LASTEXITCODE -ne 0) { $healthOk = $false }

if (-not $healthOk) { Stop-WithMessage 'One or more local Supabase health checks failed.' 71 }
Write-Host '[OK] Local Supabase is ready. Auth and Realtime are routed through the API gateway.'
Write-Host "[INFO] Ports: API=$($ports.API), DB=$($ports.DB), Analytics=$($ports.Analytics), Studio=$($ports.Studio), ShadowReserved=$($ports.ShadowReserved), Mail=$($ports.Mail)"
exit 0
