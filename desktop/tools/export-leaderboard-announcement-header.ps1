$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$PagePath = Join-Path $Root "desktop\steam\store-assets\store-page.json"

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
    [float]$H,
    [System.Drawing.StringAlignment]$Align = [System.Drawing.StringAlignment]::Near
  )

  $Rect = New-Object System.Drawing.RectangleF -ArgumentList @($X, $Y, $W, $H)
  $Format = New-Object System.Drawing.StringFormat
  $Format.Alignment = $Align
  $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
  $Format.Dispose()
}

function Draw-Chip {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [float]$X,
    [float]$Y,
    [float]$W,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$TextBrush,
    [System.Drawing.Pen]$BorderPen
  )

  $Fill = New-Brush -A 226 -R 10 -G 22 -B 36
  $Graphics.FillRectangle($Fill, $X, $Y, $W, 54)
  $Graphics.DrawRectangle($BorderPen, $X, $Y, $W, 54)
  Draw-Text -Graphics $Graphics -Text $Text -Font $Font -Brush $TextBrush -X ($X + 18) -Y ($Y + 12) -W ($W - 36) -H 30
  $Fill.Dispose()
}

$Page = Read-JsonFile -Path $PagePath
$Promo = $Page.reviewArtifacts.leaderboardPromo
$Header = $Promo.announcementHeader
if (-not $Header) {
  throw "store-page.json is missing reviewArtifacts.leaderboardPromo.announcementHeader"
}

$OutputPath = Join-Path $Root $Header.path
$OutputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Width = [int]$Header.width
$Height = [int]$Header.height
$Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Images = New-Object "System.Collections.Generic.List[System.Drawing.Image]"

try {
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $Graphics.Clear([System.Drawing.Color]::FromArgb(7, 13, 22))

  $Source = [System.Drawing.Image]::FromFile((Join-Path $Root $Promo.sourceScreenshot))
  $Frame = [System.Drawing.Image]::FromFile((Join-Path $Root $Header.sourceFrame))
  $PromoImage = [System.Drawing.Image]::FromFile((Join-Path $Root $Header.sourcePromo))
  $Images.Add($Source) | Out-Null
  $Images.Add($Frame) | Out-Null
  $Images.Add($PromoImage) | Out-Null

  $Graphics.DrawImage($Source, 0, -190, $Width, 1080)
  $Graphics.FillRectangle((New-Brush -A 224 -R 6 -G 13 -B 24), 0, 0, $Width, $Height)

  $Glow = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
    -ArgumentList @(
      (New-Object System.Drawing.Point -ArgumentList @(0, 0)),
      (New-Object System.Drawing.Point -ArgumentList @($Width, $Height)),
      ([System.Drawing.Color]::FromArgb(132, 34, 214, 220)),
      ([System.Drawing.Color]::FromArgb(88, 255, 202, 72))
    )
  $Graphics.FillRectangle($Glow, 0, 0, $Width, $Height)
  $Glow.Dispose()

  $White = New-Brush -A 255 -R 248 -G 252 -B 255
  $Muted = New-Brush -A 255 -R 197 -G 217 -B 228
  $Cyan = New-Brush -A 255 -R 92 -G 231 -B 235
  $Gold = New-Brush -A 255 -R 255 -G 205 -B 82
  $Panel = New-Brush -A 226 -R 9 -G 21 -B 34
  $PanelLight = New-Brush -A 238 -R 16 -G 32 -B 48
  $CyanPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(116, 238, 242)), 3)
  $GoldPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(255, 207, 82)), 4)

  $TitleFont = New-Font -Name "Microsoft YaHei UI" -Size 62 -Style ([System.Drawing.FontStyle]::Bold)
  $EnFont = New-Font -Name "Segoe UI" -Size 24 -Style ([System.Drawing.FontStyle]::Bold)
  $DeckFont = New-Font -Name "Microsoft YaHei UI" -Size 24 -Style ([System.Drawing.FontStyle]::Bold)
  $ChipFont = New-Font -Name "Microsoft YaHei UI" -Size 19 -Style ([System.Drawing.FontStyle]::Bold)
  $SmallFont = New-Font -Name "Microsoft YaHei UI" -Size 18 -Style ([System.Drawing.FontStyle]::Regular)

  $Graphics.FillRectangle($Panel, 72, 62, 790, 498)
  $Graphics.DrawRectangle($CyanPen, 72, 62, 790, 498)
  Draw-Text -Graphics $Graphics -Text $Header.headlineEnUS -Font $EnFont -Brush $Gold -X 116 -Y 102 -W 660 -H 34
  Draw-Text -Graphics $Graphics -Text $Header.headlineZhCN -Font $TitleFont -Brush $White -X 112 -Y 150 -W 710 -H 88
  Draw-Text -Graphics $Graphics -Text $Header.deckZhCN -Font $DeckFont -Brush $Muted -X 118 -Y 268 -W 700 -H 42

  $ChipY = 360
  $Chips = @($Header.chips)
  Draw-Chip -Graphics $Graphics -Text $Chips[0] -X 118 -Y $ChipY -W 266 -Font $ChipFont -TextBrush $White -BorderPen $GoldPen
  Draw-Chip -Graphics $Graphics -Text $Chips[1] -X 408 -Y $ChipY -W 280 -Font $ChipFont -TextBrush $Cyan -BorderPen $CyanPen
  Draw-Chip -Graphics $Graphics -Text $Chips[2] -X 118 -Y ($ChipY + 78) -W 220 -Font $ChipFont -TextBrush $Gold -BorderPen $CyanPen
  Draw-Chip -Graphics $Graphics -Text $Chips[3] -X 362 -Y ($ChipY + 78) -W 254 -Font $ChipFont -TextBrush $White -BorderPen $CyanPen
  Draw-Chip -Graphics $Graphics -Text $Chips[4] -X 640 -Y ($ChipY + 78) -W 188 -Font $ChipFont -TextBrush $Gold -BorderPen $GoldPen

  Draw-Text -Graphics $Graphics -Text $Header.footerZhCN -Font $SmallFont -Brush $Cyan -X 118 -Y 522 -W 640 -H 28

  $PreviewX = 902
  $PreviewY = 72
  $PreviewW = 870
  $PreviewH = 489
  $Graphics.FillRectangle($PanelLight, $PreviewX - 18, $PreviewY - 18, $PreviewW + 36, $PreviewH + 36)
  $Graphics.DrawRectangle($GoldPen, $PreviewX - 18, $PreviewY - 18, $PreviewW + 36, $PreviewH + 36)
  $Graphics.DrawImage($Frame, $PreviewX, $PreviewY, $PreviewW, $PreviewH)

  $MiniX = 1288
  $MiniY = 388
  $Graphics.FillRectangle((New-Brush -A 232 -R 238 -G 249 -B 252), $MiniX - 12, $MiniY - 12, 418, 236)
  $Graphics.DrawRectangle($CyanPen, $MiniX - 12, $MiniY - 12, 418, 236)
  $Graphics.DrawImage($PromoImage, $MiniX, $MiniY, 394, 222)

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
