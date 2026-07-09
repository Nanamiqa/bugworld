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

function Draw-Card {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Title,
    [string]$Value,
    [float]$X,
    [float]$Y,
    [float]$W,
    [System.Drawing.Font]$TitleFont,
    [System.Drawing.Font]$ValueFont,
    [System.Drawing.Brush]$TitleBrush,
    [System.Drawing.Brush]$ValueBrush,
    [System.Drawing.Brush]$FillBrush,
    [System.Drawing.Pen]$BorderPen
  )
  $Graphics.FillRectangle($FillBrush, $X, $Y, $W, 118)
  $Graphics.DrawRectangle($BorderPen, $X, $Y, $W, 118)
  Draw-Text -Graphics $Graphics -Text $Title -Font $TitleFont -Brush $TitleBrush -X ($X + 22) -Y ($Y + 18) -W ($W - 44) -H 30
  Draw-Text -Graphics $Graphics -Text $Value -Font $ValueFont -Brush $ValueBrush -X ($X + 22) -Y ($Y + 54) -W ($W - 44) -H 48
}

$Page = Read-JsonFile -Path $PagePath
$Promo = $Page.reviewArtifacts.leaderboardPromo
if (-not $Promo) {
  throw "store-page.json is missing reviewArtifacts.leaderboardPromo"
}

$OutputPath = Join-Path $Root $Promo.path
$SourcePath = Join-Path $Root $Promo.sourceScreenshot
$OutputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Width = [int]$Promo.width
$Height = [int]$Promo.height
$Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Images = New-Object "System.Collections.Generic.List[System.Drawing.Image]"

try {
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $Graphics.Clear([System.Drawing.Color]::FromArgb(7, 13, 22))

  $Source = [System.Drawing.Image]::FromFile($SourcePath)
  $null = $Images.Add($Source)

  $Graphics.DrawImage($Source, 0, 0, $Width, $Height)
  $Dim = New-Brush -A 190 -R 7 -G 13 -B 22
  $Graphics.FillRectangle($Dim, 0, 0, $Width, $Height)

  $GlowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
    -ArgumentList @(
      (New-Object System.Drawing.Point -ArgumentList @(0, 0)),
      (New-Object System.Drawing.Point -ArgumentList @($Width, $Height)),
      ([System.Drawing.Color]::FromArgb(118, 22, 195, 205)),
      ([System.Drawing.Color]::FromArgb(74, 251, 195, 71))
    )
  $Graphics.FillRectangle($GlowBrush, 0, 0, $Width, $Height)

  $TitleFont = New-Font -Name "Microsoft YaHei UI" -Size 82 -Style ([System.Drawing.FontStyle]::Bold)
  $EnFont = New-Font -Name "Segoe UI" -Size 25 -Style ([System.Drawing.FontStyle]::Bold)
  $SubFont = New-Font -Name "Microsoft YaHei UI" -Size 30 -Style ([System.Drawing.FontStyle]::Regular)
  $CardTitleFont = New-Font -Name "Microsoft YaHei UI" -Size 22 -Style ([System.Drawing.FontStyle]::Bold)
  $CardValueFont = New-Font -Name "Microsoft YaHei UI" -Size 26 -Style ([System.Drawing.FontStyle]::Bold)
  $SmallFont = New-Font -Name "Microsoft YaHei UI" -Size 18 -Style ([System.Drawing.FontStyle]::Regular)

  $White = New-Brush -A 255 -R 248 -G 252 -B 255
  $Muted = New-Brush -A 255 -R 194 -G 212 -B 224
  $Cyan = New-Brush -A 255 -R 92 -G 231 -B 235
  $Gold = New-Brush -A 255 -R 255 -G 205 -B 82
  $DarkPanel = New-Brush -A 220 -R 11 -G 21 -B 34
  $CardFill = New-Brush -A 232 -R 18 -G 31 -B 48
  $FrameFill = New-Brush -A 232 -R 232 -G 247 -B 251
  $CyanPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(116, 238, 242)), 3)
  $GoldPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(255, 207, 82)), 4)

  $Graphics.FillRectangle($DarkPanel, 92, 86, 840, 870)
  $Graphics.DrawRectangle($CyanPen, 92, 86, 840, 870)

  Draw-Text -Graphics $Graphics -Text $Promo.titleZhCN -Font $TitleFont -Brush $White -X 136 -Y 130 -W 760 -H 112
  Draw-Text -Graphics $Graphics -Text $Promo.titleEnUS -Font $EnFont -Brush $Gold -X 142 -Y 242 -W 720 -H 42
  Draw-Text -Graphics $Graphics -Text $Promo.subtitleZhCN -Font $SubFont -Brush $Muted -X 142 -Y 302 -W 690 -H 92

  $BadgeY = 432
  foreach ($Badge in $Promo.badges) {
    $Graphics.FillRectangle((New-Brush -A 214 -R 20 -G 47 -B 62), 142, $BadgeY, 640, 52)
    $Graphics.DrawRectangle($CyanPen, 142, $BadgeY, 640, 52)
    Draw-Text -Graphics $Graphics -Text $Badge -Font $CardTitleFont -Brush $White -X 164 -Y ($BadgeY + 11) -W 590 -H 34
    $BadgeY += 68
  }

  Draw-Text -Graphics $Graphics -Text $Promo.footerZhCN -Font $SmallFont -Brush $Cyan -X 142 -Y 846 -W 700 -H 56

  $FrameX = 996
  $FrameY = 150
  $FrameW = 794
  $FrameH = 446
  $Graphics.FillRectangle($FrameFill, $FrameX - 18, $FrameY - 18, $FrameW + 36, $FrameH + 36)
  $Graphics.DrawRectangle($GoldPen, $FrameX - 18, $FrameY - 18, $FrameW + 36, $FrameH + 36)
  $Graphics.DrawImage($Source, $FrameX, $FrameY, $FrameW, $FrameH)

  $CardX = 1002
  $CardY = 672
  $CardW = 372
  Draw-Card -Graphics $Graphics -Title $Promo.cardTitles[0] -Value $Promo.cardValues[0] -X $CardX -Y $CardY -W $CardW -TitleFont $CardTitleFont -ValueFont $CardValueFont -TitleBrush $Cyan -ValueBrush $White -FillBrush $CardFill -BorderPen $CyanPen
  Draw-Card -Graphics $Graphics -Title $Promo.cardTitles[1] -Value $Promo.cardValues[1] -X ($CardX + 420) -Y $CardY -W $CardW -TitleFont $CardTitleFont -ValueFont $CardValueFont -TitleBrush $Gold -ValueBrush $White -FillBrush $CardFill -BorderPen $CyanPen
  Draw-Card -Graphics $Graphics -Title $Promo.cardTitles[2] -Value $Promo.cardValues[2] -X $CardX -Y ($CardY + 146) -W $CardW -TitleFont $CardTitleFont -ValueFont $CardValueFont -TitleBrush $Gold -ValueBrush $White -FillBrush $CardFill -BorderPen $CyanPen
  Draw-Card -Graphics $Graphics -Title $Promo.cardTitles[3] -Value $Promo.cardValues[3] -X ($CardX + 420) -Y ($CardY + 146) -W $CardW -TitleFont $CardTitleFont -ValueFont $CardValueFont -TitleBrush $Cyan -ValueBrush $White -FillBrush $CardFill -BorderPen $CyanPen

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
