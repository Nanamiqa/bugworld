$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$AnnouncementPath = Join-Path $Root "desktop\steam\announcement-draft.json"
$Announcement = [System.IO.File]::ReadAllText($AnnouncementPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

function New-Font {
  param([string]$Name, [float]$Size, [System.Drawing.FontStyle]$Style)
  return New-Object System.Drawing.Font -ArgumentList @($Name, $Size, $Style)
}

function New-Brush {
  param([int]$A, [int]$R, [int]$G, [int]$B)
  return New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb($A, $R, $G, $B))
}

function Draw-Text {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [float]$X,
    [float]$Y,
    [float]$W,
    [float]$H
  )
  $Rect = New-Object System.Drawing.RectangleF -ArgumentList @($X, $Y, $W, $H)
  $Format = New-Object System.Drawing.StringFormat
  $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
  $Format.Dispose()
}

function Draw-Asset {
  param(
    [string]$OutputPath,
    [int]$Width,
    [int]$Height,
    [string]$Mode
  )

  $OutputDir = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Images = New-Object "System.Collections.Generic.List[System.Drawing.Image]"

  try {
    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $Graphics.Clear([System.Drawing.Color]::FromArgb(10, 15, 23))

    $Hero = [System.Drawing.Image]::FromFile((Join-Path $Root "desktop\steam\store-assets\export\library_hero.png"))
    $Boss = [System.Drawing.Image]::FromFile((Join-Path $Root "desktop\steam\store-assets\screenshots\04-boss-protocol-rider.png"))
    $Build = [System.Drawing.Image]::FromFile((Join-Path $Root "desktop\steam\store-assets\screenshots\03-roguelite-build.png"))
    $null = $Images.Add($Hero)
    $null = $Images.Add($Boss)
    $null = $Images.Add($Build)

    $Overlay = New-Brush -A 132 -R 6 -G 10 -B 16
    $Panel = New-Brush -A 210 -R 18 -G 26 -B 38
    $TitleBrush = New-Brush -A 255 -R 246 -G 250 -B 255
    $SubBrush = New-Brush -A 255 -R 188 -G 204 -B 218
    $AccentBrush = New-Brush -A 255 -R 252 -G 200 -B 82
    $CyanBrush = New-Brush -A 255 -R 89 -G 217 -B 225
    $BorderPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(92, 220, 230)), 2)

    $Graphics.DrawImage($Hero, 0, 0, $Width, $Height)
    $Graphics.FillRectangle($Overlay, 0, 0, $Width, $Height)

    if ($Mode -eq "cover") {
      $TitleFont = New-Font -Name "Microsoft YaHei UI" -Size 34 -Style ([System.Drawing.FontStyle]::Bold)
      $SubFont = New-Font -Name "Microsoft YaHei UI" -Size 17 -Style ([System.Drawing.FontStyle]::Regular)
      $TinyFont = New-Font -Name "Segoe UI" -Size 13 -Style ([System.Drawing.FontStyle]::Bold)
      $Graphics.FillRectangle($Panel, 34, 282, 732, 134)
      $Graphics.DrawRectangle($BorderPen, 34, 282, 732, 134)
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.titleZhCN -Font $TitleFont -Brush $TitleBrush -X 58 -Y 302 -W 660 -H 48
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.titleEnUS -Font $TinyFont -Brush $AccentBrush -X 62 -Y 352 -W 360 -H 24
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.subtitleZhCN -Font $SubFont -Brush $SubBrush -X 62 -Y 378 -W 650 -H 28
      $Graphics.DrawImage($Boss, 436, 40, 300, 169)
      $Graphics.DrawRectangle($BorderPen, 436, 40, 300, 169)
    } else {
      $TitleFont = New-Font -Name "Microsoft YaHei UI" -Size 52 -Style ([System.Drawing.FontStyle]::Bold)
      $EnFont = New-Font -Name "Segoe UI" -Size 25 -Style ([System.Drawing.FontStyle]::Bold)
      $SubFont = New-Font -Name "Microsoft YaHei UI" -Size 22 -Style ([System.Drawing.FontStyle]::Regular)
      $ChipFont = New-Font -Name "Segoe UI" -Size 14 -Style ([System.Drawing.FontStyle]::Bold)
      $Graphics.FillRectangle($Panel, 90, 338, 1040, 206)
      $Graphics.DrawRectangle($BorderPen, 90, 338, 1040, 206)
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.titleZhCN -Font $TitleFont -Brush $TitleBrush -X 126 -Y 360 -W 470 -H 70
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.titleEnUS -Font $EnFont -Brush $AccentBrush -X 132 -Y 430 -W 470 -H 42
      Draw-Text -Graphics $Graphics -Text $Announcement.assetText.subtitleZhCN -Font $SubFont -Brush $SubBrush -X 620 -Y 374 -W 470 -H 80
      Draw-Text -Graphics $Graphics -Text "Chapters / Builds / Bosses / Feedback" -Font $ChipFont -Brush $CyanBrush -X 622 -Y 462 -W 500 -H 32
      $Graphics.DrawImage($Boss, 1190, 78, 520, 293)
      $Graphics.DrawImage($Build, 1324, 320, 440, 247)
      $Graphics.DrawRectangle($BorderPen, 1190, 78, 520, 293)
      $Graphics.DrawRectangle($BorderPen, 1324, 320, 440, 247)
    }

    $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output ("Wrote {0}" -f ($OutputPath.Substring($Root.Length + 1)))
  }
  finally {
    foreach ($Image in $Images) {
      $Image.Dispose()
    }
    if ($Graphics) {
      $Graphics.Dispose()
    }
    if ($Bitmap) {
      $Bitmap.Dispose()
    }
  }
}

$CoverPath = Join-Path $Root $Announcement.eventAssets.cover.path
$HeaderPath = Join-Path $Root $Announcement.eventAssets.header.path
Draw-Asset -OutputPath $CoverPath -Width ([int]$Announcement.eventAssets.cover.width) -Height ([int]$Announcement.eventAssets.cover.height) -Mode "cover"
Draw-Asset -OutputPath $HeaderPath -Width ([int]$Announcement.eventAssets.header.width) -Height ([int]$Announcement.eventAssets.header.height) -Mode "header"
