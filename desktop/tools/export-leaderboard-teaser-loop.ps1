$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$PagePath = Join-Path $Root "desktop\steam\store-assets\store-page.json"

function Read-JsonFile {
  param([string]$Path)
  $Text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  return $Text | ConvertFrom-Json
}

function Get-GifCodec {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/gif" } |
    Select-Object -First 1
}

function New-EncoderParameters {
  param([System.Drawing.Imaging.EncoderValue]$Value)

  $Parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $Parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::SaveFlag,
    [long]$Value
  )
  return $Parameters
}

function New-PropertyItem {
  param(
    [int]$Id,
    [int]$Type,
    [byte[]]$Value
  )

  $Property = [System.Runtime.Serialization.FormatterServices]::GetUninitializedObject(
    [System.Drawing.Imaging.PropertyItem]
  )
  $Property.Id = $Id
  $Property.Type = $Type
  $Property.Len = $Value.Length
  $Property.Value = $Value
  return $Property
}

function Set-GifTiming {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$FrameCount,
    [int]$FrameDelayMs
  )

  $DelayHundredths = [Math]::Max(6, [Math]::Round($FrameDelayMs / 10))
  $DelayBytes = New-Object byte[] (4 * $FrameCount)
  for ($Index = 0; $Index -lt $FrameCount; $Index++) {
    [Array]::Copy([BitConverter]::GetBytes([int]$DelayHundredths), 0, $DelayBytes, $Index * 4, 4)
  }
  $Bitmap.SetPropertyItem((New-PropertyItem -Id 0x5100 -Type 4 -Value $DelayBytes))

  $LoopBytes = [byte[]](0, 0, 0, 0)
  $Bitmap.SetPropertyItem((New-PropertyItem -Id 0x5101 -Type 3 -Value $LoopBytes))
}

function New-ScaledFrame {
  param(
    [string]$Path,
    [int]$Width,
    [int]$Height
  )

  $Source = [System.Drawing.Image]::FromFile($Path)
  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  try {
    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $Graphics.DrawImage($Source, 0, 0, $Width, $Height)
  }
  finally {
    $Graphics.Dispose()
    $Source.Dispose()
  }

  return $Bitmap
}

$Page = Read-JsonFile -Path $PagePath
$Promo = $Page.reviewArtifacts.leaderboardPromo
$Loop = $Promo.animatedLoop
if (-not $Loop) {
  throw "store-page.json is missing reviewArtifacts.leaderboardPromo.animatedLoop"
}

$OutputPath = Join-Path $Root $Loop.path
$OutputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Frames = New-Object "System.Collections.Generic.List[System.Drawing.Bitmap]"
try {
  foreach ($FramePath in $Loop.frames) {
    $AbsoluteFramePath = Join-Path $Root $FramePath
    if (-not (Test-Path -LiteralPath $AbsoluteFramePath)) {
      throw "Missing leaderboard teaser frame: $FramePath"
    }
    $Frames.Add((New-ScaledFrame -Path $AbsoluteFramePath -Width ([int]$Loop.width) -Height ([int]$Loop.height))) | Out-Null
  }

  if ($Frames.Count -lt 2) {
    throw "The leaderboard teaser loop needs at least two frames"
  }

  $GifCodec = Get-GifCodec
  if (-not $GifCodec) {
    throw "System.Drawing GIF encoder is not available"
  }

  $FirstFrame = $Frames[0]
  Set-GifTiming -Bitmap $FirstFrame -FrameCount $Frames.Count -FrameDelayMs ([int]$Loop.frameDelayMs)

  $FirstFrame.Save($OutputPath, $GifCodec, (New-EncoderParameters -Value ([System.Drawing.Imaging.EncoderValue]::MultiFrame)))
  for ($Index = 1; $Index -lt $Frames.Count; $Index++) {
    $FirstFrame.SaveAdd($Frames[$Index], (New-EncoderParameters -Value ([System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)))
  }
  $FirstFrame.SaveAdd((New-EncoderParameters -Value ([System.Drawing.Imaging.EncoderValue]::Flush)))

  Write-Output ("Wrote {0}" -f ($OutputPath.Substring($Root.Length + 1)))
}
finally {
  foreach ($Frame in $Frames) {
    $Frame.Dispose()
  }
}
