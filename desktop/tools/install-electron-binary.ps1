$ErrorActionPreference = "Stop"

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$ElectronPackage = Join-Path $Root "node_modules\electron"
$ElectronInstall = Join-Path $ElectronPackage "install.js"
$ElectronExe = Join-Path $ElectronPackage "dist\electron.exe"
$CacheDir = Join-Path $Root "tmp\electron-cache"

if (-not (Test-Path -LiteralPath $ElectronInstall)) {
  throw "Electron npm package is missing. Run npm install first."
}

New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null

if (-not $env:ELECTRON_MIRROR) {
  $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
}

if (-not $env:electron_config_cache) {
  $env:electron_config_cache = $CacheDir
}

Write-Output ("Using ELECTRON_MIRROR=" + $env:ELECTRON_MIRROR)
Write-Output ("Using electron_config_cache=" + $env:electron_config_cache)

node $ElectronInstall

if (-not (Test-Path -LiteralPath $ElectronExe)) {
  throw "Electron install finished but electron.exe is still missing."
}

$VersionFile = Join-Path $ElectronPackage "dist\version"
$Version = "unknown"
if (Test-Path -LiteralPath $VersionFile) {
  $Version = [System.IO.File]::ReadAllText($VersionFile, [System.Text.Encoding]::UTF8).Trim()
}

Write-Output ("Electron binary ready: " + $ElectronExe)
Write-Output ("Electron version: " + $Version)
