$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$ContentPath = Join-Path $Root "desktop\steam\store-content.json"
$AssetsPath = Join-Path $Root "desktop\steam\store-assets\store-assets.json"

function Read-JsonFile {
  param([string]$Path)
  $Text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  return $Text | ConvertFrom-Json
}

function New-Font {
  param([string]$Name, [float]$Size, [System.Drawing.FontStyle]$Style)
  return New-Object System.Drawing.Font -ArgumentList @($Name, $Size, $Style)
}

function New-Brush {
  param([int]$R, [int]$G, [int]$B)
  return New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb($R, $G, $B))
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
  $Format.FormatFlags = 0
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
  $Format.Dispose()
}

function Draw-Pill {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [float]$X,
    [float]$Y,
    [float]$W,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$TextBrush,
    [System.Drawing.Brush]$FillBrush,
    [System.Drawing.Pen]$Pen
  )
  $Graphics.FillRectangle($FillBrush, $X, $Y, $W, 32)
  $Graphics.DrawRectangle($Pen, $X, $Y, $W, 32)
  Draw-Text -Graphics $Graphics -Text $Text -Font $Font -Brush $TextBrush -X ($X + 10) -Y ($Y + 7) -W ($W - 20) -H 22
}

$Content = Read-JsonFile -Path $ContentPath
$Assets = Read-JsonFile -Path $AssetsPath

$PreviewMap = @{}
foreach ($Preview in $Content.reviewArtifacts.contentPreviews) {
  $PreviewMap[$Preview.locale] = $Preview
}

$HeaderPath = Join-Path $Root "desktop\steam\store-assets\export\main_capsule.png"
$BossShotPath = Join-Path $Root "desktop\steam\store-assets\screenshots\04-boss-protocol-rider.png"
$MapShotPath = Join-Path $Root "desktop\steam\store-assets\screenshots\02-office-map.png"

foreach ($Localization in $Content.localizations) {
  $Preview = $PreviewMap[$Localization.locale]
  if (-not $Preview) {
    throw "Missing preview artifact for locale $($Localization.locale)"
  }

  $OutputPath = Join-Path $Root $Preview.path
  $OutputDir = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

  $Width = [int]$Preview.width
  $Height = [int]$Preview.height
  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Images = New-Object "System.Collections.Generic.List[System.Drawing.Image]"

  try {
    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $Graphics.Clear([System.Drawing.Color]::FromArgb(11, 15, 22))

    $HeaderImage = [System.Drawing.Image]::FromFile($HeaderPath)
    $BossImage = [System.Drawing.Image]::FromFile($BossShotPath)
    $MapImage = [System.Drawing.Image]::FromFile($MapShotPath)
    $null = $Images.Add($HeaderImage)
    $null = $Images.Add($BossImage)
    $null = $Images.Add($MapImage)

    $TitleFont = New-Font -Name "Segoe UI" -Size 31 -Style ([System.Drawing.FontStyle]::Bold)
    $SubFont = New-Font -Name "Segoe UI" -Size 16 -Style ([System.Drawing.FontStyle]::Regular)
    $HeadingFont = New-Font -Name "Segoe UI" -Size 20 -Style ([System.Drawing.FontStyle]::Bold)
    $BodyFont = New-Font -Name "Microsoft YaHei UI" -Size 13 -Style ([System.Drawing.FontStyle]::Regular)
    $SmallFont = New-Font -Name "Segoe UI" -Size 11 -Style ([System.Drawing.FontStyle]::Regular)
    $PillFont = New-Font -Name "Segoe UI" -Size 11 -Style ([System.Drawing.FontStyle]::Bold)
    $TitleBrush = New-Brush -R 245 -G 250 -B 255
    $SubBrush = New-Brush -R 176 -G 191 -B 208
    $BodyBrush = New-Brush -R 220 -G 232 -B 240
    $AccentBrush = New-Brush -R 252 -G 199 -B 89
    $CyanBrush = New-Brush -R 86 -G 214 -B 222
    $PanelBrush = New-Brush -R 25 -G 32 -B 43
    $PanelAltBrush = New-Brush -R 33 -G 41 -B 53
    $PillBrush = New-Brush -R 43 -G 55 -B 72
    $BorderPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(72, 186, 198)), 2)
    $DimPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(61, 76, 94)), 1)

    $Graphics.DrawImage($HeaderImage, 48, 32, 780, 448)
    $Graphics.DrawRectangle($BorderPen, 48, 32, 780, 448)
    $Graphics.DrawImage($BossImage, 72, 370, 350, 197)
    $Graphics.DrawImage($MapImage, 442, 370, 350, 197)
    $Graphics.DrawRectangle($DimPen, 72, 370, 350, 197)
    $Graphics.DrawRectangle($DimPen, 442, 370, 350, 197)

    $AppName = $Content.appIdentity.appNameEnUS
    if ($Localization.locale -eq "zh-CN") {
      $AppName = $Content.appIdentity.appNameZhCN
    }

    Draw-Text -Graphics $Graphics -Text ($AppName + " - Store Preview") -Font $TitleFont -Brush $TitleBrush -X 872 -Y 42 -W 980 -H 48
    Draw-Text -Graphics $Graphics -Text ("Locale: " + $Localization.locale + " / Steam: " + $Localization.steamLanguageCode) -Font $SubFont -Brush $SubBrush -X 876 -Y 92 -W 860 -H 34
    Draw-Text -Graphics $Graphics -Text $Localization.shortDescription -Font $BodyFont -Brush $BodyBrush -X 876 -Y 136 -W 900 -H 90

    $PillY = 242
    $PillX = 876
    foreach ($Tag in ($Content.tags | Select-Object -First 8)) {
      Draw-Pill -Graphics $Graphics -Text $Tag.name -X $PillX -Y $PillY -W 164 -Font $PillFont -TextBrush $TitleBrush -FillBrush $PillBrush -Pen $DimPen
      $PillX += 174
      if ($PillX -gt 1680) {
        $PillX = 876
        $PillY += 42
      }
    }

    $Graphics.FillRectangle($PanelBrush, 48, 602, 836, 414)
    $Graphics.DrawRectangle($BorderPen, 48, 602, 836, 414)
    Draw-Text -Graphics $Graphics -Text "ABOUT THIS GAME" -Font $HeadingFont -Brush $AccentBrush -X 76 -Y 626 -W 760 -H 34

    $AboutY = 672
    foreach ($Section in $Localization.aboutSections) {
      Draw-Text -Graphics $Graphics -Text $Section.heading -Font $HeadingFont -Brush $CyanBrush -X 76 -Y $AboutY -W 760 -H 30
      Draw-Text -Graphics $Graphics -Text $Section.body -Font $BodyFont -Brush $BodyBrush -X 76 -Y ($AboutY + 34) -W 760 -H 72
      $AboutY += 112
    }

    $Graphics.FillRectangle($PanelAltBrush, 920, 352, 560, 318)
    $Graphics.DrawRectangle($DimPen, 920, 352, 560, 318)
    Draw-Text -Graphics $Graphics -Text "FEATURES" -Font $HeadingFont -Brush $AccentBrush -X 944 -Y 376 -W 510 -H 30
    $BulletY = 426
    foreach ($Bullet in $Localization.featureBullets) {
      Draw-Text -Graphics $Graphics -Text ("- " + $Bullet) -Font $BodyFont -Brush $BodyBrush -X 948 -Y $BulletY -W 500 -H 44
      $BulletY += 46
    }

    $Graphics.FillRectangle($PanelAltBrush, 1504, 352, 368, 318)
    $Graphics.DrawRectangle($DimPen, 1504, 352, 368, 318)
    Draw-Text -Graphics $Graphics -Text "STORE FEATURES" -Font $HeadingFont -Brush $AccentBrush -X 1528 -Y 376 -W 320 -H 30
    $FeatureY = 426
    foreach ($Feature in $Content.storeFeatures) {
      $StatusLabel = $Feature.status -replace "_", " "
      Draw-Text -Graphics $Graphics -Text ($Feature.name + " / " + $StatusLabel) -Font $BodyFont -Brush $BodyBrush -X 1532 -Y $FeatureY -W 300 -H 54
      $FeatureY += 58
    }

    $Graphics.FillRectangle($PanelBrush, 920, 704, 952, 312)
    $Graphics.DrawRectangle($BorderPen, 920, 704, 952, 312)
    Draw-Text -Graphics $Graphics -Text "WINDOWS SYSTEM REQUIREMENTS DRAFT" -Font $HeadingFont -Brush $AccentBrush -X 948 -Y 728 -W 880 -H 32
    $Min = $Content.systemRequirements.windows.minimum
    $Rec = $Content.systemRequirements.windows.recommended
    $MinText = "Minimum: " + $Min.os + "; " + $Min.processor + "; " + $Min.memory + "; " + $Min.graphics + "; " + $Min.storage
    $RecText = "Recommended: " + $Rec.os + "; " + $Rec.processor + "; " + $Rec.memory + "; " + $Rec.graphics + "; " + $Rec.storage
    Draw-Text -Graphics $Graphics -Text $MinText -Font $BodyFont -Brush $BodyBrush -X 948 -Y 778 -W 880 -H 70
    Draw-Text -Graphics $Graphics -Text $RecText -Font $BodyFont -Brush $BodyBrush -X 948 -Y 858 -W 880 -H 70
    Draw-Text -Graphics $Graphics -Text ("Review note: " + $Content.systemRequirements.status) -Font $SmallFont -Brush $SubBrush -X 948 -Y 940 -W 880 -H 30

    $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output ("Wrote {0}" -f $Preview.path)
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
