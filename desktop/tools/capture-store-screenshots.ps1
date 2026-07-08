param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [int]$Port = 4184,
  [string[]]$OnlyId = @(),
  [int]$TimeoutMs = 12000
)

$ErrorActionPreference = "Stop"

$defaultRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
if (-not (Test-Path (Join-Path $Root "desktop\steam\store-assets\store-assets.json"))) {
  if ($Root -and $OnlyId.Count -eq 0) {
    $OnlyId = @($Root)
  }
  $Root = $defaultRoot
}

$node = (Get-Command node -ErrorAction Stop).Source
$script = Join-Path $PSScriptRoot "capture-store-screenshots.cjs"
$arguments = @(
  $script,
  "--root", $Root,
  "--port", "$Port",
  "--timeout-ms", "$TimeoutMs"
)

foreach ($id in $OnlyId) {
  if ($id) {
    $arguments += @("--only-id", $id)
  }
}

& $node @arguments
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
