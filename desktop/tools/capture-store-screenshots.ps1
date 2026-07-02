param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [int]$Port = 4184
)

$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $Root "desktop\steam\store-assets\store-assets.json"
$manifest = Get-Content -Path $manifestPath -Encoding UTF8 | ConvertFrom-Json
$screenshotsDir = Join-Path $Root "desktop\steam\store-assets\screenshots"
New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null

$browserCandidates = @(@(
  $env:CHROME_PATH,
  $env:EDGE_PATH,
  "C:\Program Files\Microsoft Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) | Where-Object { $_ -and (Test-Path $_) }
)

if (-not $browserCandidates.Count) {
  throw "No Edge or Chrome executable was found for headless screenshot capture."
}

$browser = $browserCandidates[0]
$python = (Get-Command python -ErrorAction Stop).Source
$tmpDir = Join-Path $Root "tmp"
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null
$serverOut = Join-Path $tmpDir "store-screenshot-server.out.log"
$serverErr = Join-Path $tmpDir "store-screenshot-server.err.log"

$server = Start-Process -FilePath $python -ArgumentList @("-m", "http.server", "$Port", "--bind", "127.0.0.1") -WorkingDirectory $Root -RedirectStandardOutput $serverOut -RedirectStandardError $serverErr -WindowStyle Hidden -PassThru

try {
  Start-Sleep -Milliseconds 900
  $probe = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 5
  if ($probe.StatusCode -ne 200) {
    throw "Local screenshot server returned $($probe.StatusCode)."
  }

  foreach ($shot in $manifest.screenshots) {
    $outputPath = Join-Path $Root $shot.targetFile
    $outputDir = Split-Path -Parent $outputPath
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    $url = "http://127.0.0.1:$Port/$($shot.captureUrl)"
    $profileDir = Join-Path $tmpDir "store-screenshot-profile-$($shot.id)"
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    $commonArgs = @(
      "--disable-gpu",
      "--disable-gpu-sandbox",
      "--disable-gpu-compositing",
      "--disable-software-rasterizer",
      "--disable-accelerated-2d-canvas",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-features=CalculateNativeWinOcclusion,Vulkan,DefaultANGLEVulkan,UseSkiaRenderer",
      "--hide-scrollbars",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-sandbox",
      "--user-data-dir=$profileDir",
      "--force-device-scale-factor=1",
      "--window-size=$($shot.width),$($shot.height)",
      "--screenshot=$outputPath",
      $url
    )
    $args = @(
      "--headless=new"
    ) + $commonArgs
    & $browser @args | Out-Null
    if ($LASTEXITCODE -ne 0) {
      $fallbackArgs = @(
        "--headless"
      ) + $commonArgs
      & $browser @fallbackArgs | Out-Null
    }
    if (-not (Test-Path $outputPath)) {
      throw "Screenshot was not written: $($shot.targetFile)"
    }
    $length = (Get-Item $outputPath).Length
    if ($length -lt 10000) {
      throw "Screenshot looks too small: $($shot.targetFile) ($length bytes)"
    }
    Write-Output "Captured $($shot.id) -> $($shot.targetFile) ($($shot.width) x $($shot.height))"
    if (Test-Path $profileDir) {
      Remove-Item -LiteralPath $profileDir -Recurse -Force
    }
  }
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
  Get-ChildItem -LiteralPath $tmpDir -Directory -Filter "store-screenshot-profile-*" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force
}
