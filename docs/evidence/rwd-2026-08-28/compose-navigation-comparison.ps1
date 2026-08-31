Add-Type -AssemblyName System.Drawing
$reference = [System.Drawing.Image]::FromFile('C:\Users\diorl\AppData\Local\Temp\codex-clipboard-072454b5-d025-4ddc-b10e-12b6462c0ed8.png')
$implementation = [System.Drawing.Image]::FromFile('D:\旅遊安排\docs\evidence\rwd-2026-08-28\today-navigation-fixed-full.png')
$canvas = New-Object System.Drawing.Bitmap 924,157
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.DrawImage($reference,0,0,452,157)
$sourceRect = New-Object System.Drawing.Rectangle 0,365,294,102
$targetRect = New-Object System.Drawing.Rectangle 472,0,452,157
$graphics.DrawImage($implementation,$targetRect,$sourceRect,[System.Drawing.GraphicsUnit]::Pixel)
$canvas.Save('D:\旅遊安排\docs\evidence\rwd-2026-08-28\navigation-button-comparison.png',[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$canvas.Dispose()
$implementation.Dispose()
$reference.Dispose()
