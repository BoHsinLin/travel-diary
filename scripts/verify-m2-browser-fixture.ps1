[CmdletBinding()]
param(
  [string]$SupabaseExecutable = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$fixturePath = Join-Path $projectRoot 'supabase\fixtures\m2_browser_evidence.sql'
$queryEndpoint = 'http://127.0.0.1:55434/api/platform/pg-meta/default/query'

function Resolve-SupabaseCli {
  if ($SupabaseExecutable) {
    if (Test-Path -LiteralPath $SupabaseExecutable) { return (Resolve-Path $SupabaseExecutable).Path }
    throw "Supabase CLI not found at '$SupabaseExecutable'."
  }

  $command = Get-Command supabase -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $cliRoot = Join-Path $env:LOCALAPPDATA 'pnpm\store\v11\links\@supabase\cli-windows-x64'
  $candidate = Get-ChildItem -LiteralPath $cliRoot -Recurse -Filter supabase.exe -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if ($candidate) { return $candidate.FullName }

  throw 'Supabase CLI is unavailable. Install it or pass -SupabaseExecutable <path>.'
}

function Invoke-LocalQuery([string]$Query) {
  $body = @{ query = $Query } | ConvertTo-Json -Compress
  return Invoke-RestMethod -Method Post -Uri $queryEndpoint -ContentType 'application/json' -Body $body -TimeoutSec 30
}

if (-not (Test-Path -LiteralPath $fixturePath)) {
  throw "Fixture not found: $fixturePath"
}

try {
  $health = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:55431/auth/v1/health' -TimeoutSec 5
  if ($health.StatusCode -ne 200) { throw "Unexpected local Auth status $($health.StatusCode)." }
} catch {
  throw "Local Supabase is unavailable at 127.0.0.1:55431. No remote fallback is allowed. $($_.Exception.Message)"
}

$fixtureSql = Get-Content -LiteralPath $fixturePath -Raw
foreach ($attempt in 1..2) {
  $null = Invoke-LocalQuery $fixtureSql
  Write-Host "PASS fixture apply $attempt/2"
}

$assertionSql = @'
select
  (select count(*) from public.platform_roles
    where (user_id, role) in (
      ('00000000-0000-0000-0000-000000000201'::uuid, 'data_reviewer'::public.platform_role),
      ('00000000-0000-0000-0000-000000000202'::uuid, 'platform_admin'::public.platform_role)
    )) = 2 as roles_ok,
  ((select count(*) from public.events
      where id = '72000000-0000-0000-0000-000000000001'
        and publication_status = 'published')
   + (select count(*) from public.canonical_places
      where id = '73000000-0000-0000-0000-000000000001'
        and publication_status = 'published')) = 2 as published_cards_ok,
  exists (select 1 from public.events
    where id = '72000000-0000-0000-0000-000000000002'
      and publication_status = 'draft') as draft_ok,
  exists (select 1 from public.data_review_queue
    where id = '75000000-0000-0000-0000-000000000001'
      and event_id = '72000000-0000-0000-0000-000000000002'
      and status = 'pending') as pending_ok,
  exists (select 1 from public.event_change_notifications
    where id = '74000000-0000-0000-0000-000000000001'
      and acknowledged_at is null) as notification_ok;
'@

$assertions = @(Invoke-LocalQuery $assertionSql)
if ($assertions.Count -ne 1) { throw 'Fixture assertion query returned an unexpected row count.' }
$row = $assertions[0]
$failed = @('roles_ok', 'published_cards_ok', 'draft_ok', 'pending_ok', 'notification_ok') |
  Where-Object { $row.$_ -ne $true }
if ($failed.Count -gt 0) { throw "Fixture assertions failed: $($failed -join ', ')" }
Write-Host 'PASS fixture assertions 5/5'

$cli = Resolve-SupabaseCli
Push-Location $projectRoot
try {
  & $cli test db --local
  if ($LASTEXITCODE -ne 0) { throw "pgTAP failed with exit code $LASTEXITCODE." }
} finally {
  Pop-Location
}

Write-Host 'PASS local M2 fixture replay and pgTAP verification'
