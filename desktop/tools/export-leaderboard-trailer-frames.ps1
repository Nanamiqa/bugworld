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
    [float]$H
  )
  $Rect = New-Object System.Drawing.RectangleF -ArgumentList @($X, $Y, $W, $H)
  $Format = New-Object System.Drawing.StringFormat
  $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
  $Format.Dispose()
}

function Draw-Frame {
  param(
    [object]$Frame,
    [int]$Index,
    [int]$Total,
    [System.Drawing.Image]$SourceImage,
    [System.Drawing.Image]$PromoImage
  )

  $OutputPath = Join-Path $Root $Frame.path
  $OutputDir = Split-Path -Parent $OutputPath
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

  $Width = [int]$Frame.width
  $Height = [int]$Frame.height
  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)

  try {
    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $Graphics.DrawImage($SourceImage, 0, 0, $Width, $Height)
    $Graphics.FillRectangle((New-Brush -A 206 -R 6 -G 12 -B 22), 0, 0, $Width, $Height)

    $Gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush `
      -ArgumentList @(
        (New-Object System.Drawing.Point -ArgumentList @(0, 0)),
        (New-Object System.Drawing.Point -ArgumentList @($Width, $Height)),
        ([System.Drawing.Color]::FromArgb(96, 32, 214, 226)),
        ([System.Drawing.Color]::FromArgb(72, 255, 197, 76))
      )
    $Graphics.FillRectangle($Gradient, 0, 0, $Width, $Height)
    $Gradient.Dispose()

    $TitleFont = New-Font -Name "Microsoft YaHei UI" -Size 82 -Style ([System.Drawing.FontStyle]::Bold)
    $SubFont = New-Font -Name "Microsoft YaHei UI" -Size 27 -Style ([System.Drawing.FontStyle]::Regular)
    $TagFont = New-Font -Name "Segoe UI" -Size 20 -Style ([System.Drawing.FontStyle]::Bold)
    $MetricTitleFont = New-Font -Name "Microsoft YaHei UI" -Size 26 -Style ([System.Drawing.FontStyle]::Bold)
    $MetricValueFont = New-Font -Name "Microsoft YaHei UI" -Size 50 -Style ([System.Drawing.FontStyle]::Bold)
    $SmallFont = New-Font -Name "Segoe UI" -Size 18 -Style ([System.Drawing.FontStyle]::Bold)

    $White = New-Brush -A 255 -R 248 -G 252 -B 255
    $Muted = New-Brush -A 255 -R 202 -G 219 -B 230
    $Cyan = New-Brush -A 255 -R 92 -G 231 -B 235
    $Gold = New-Brush -A 255 -R 255 -G 205 -B 82
    $Panel = New-Brush -A 224 -R 12 -G 23 -B 38
    $PanelLight = New-Brush -A 236 -R 18 -G 32 -B 50
    $CyanPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(116, 238, 242)), 3)
    $GoldPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(255, 207, 82)), 4)

    $Graphics.FillRectangle($Panel, 88, 94, 760, 840)
    $Graphics.DrawRectangle($CyanPen, 88, 94, 760, 840)
    Draw-Text -Graphics $Graphics -Text $Frame.tag -Font $TagFont -Brush $Gold -X 132 -Y 132 -W 300 -H 34
    Draw-Text -Graphics $Graphics -Text $Frame.titleZhCN -Font $TitleFont -Brush $White -X 130 -Y 184 -W 660 -H 118
    Draw-Text -Graphics $Graphics -Text $Frame.subtitleZhCN -Font $SubFont -Brush $Muted -X 138 -Y 328 -W 620 -H 118

    $Graphics.FillRectangle($PanelLight, 138, 520, 610, 170)
    $Graphics.DrawRectangle($GoldPen, 138, 520, 610, 170)
    Draw-Text -Graphics $Graphics -Text $Frame.metricTitle -Font $MetricTitleFont -Brush $Cyan -X 172 -Y 548 -W 540 -H 40
    Draw-Text -Graphics $Graphics -Text $Frame.metricValue -Font $MetricValueFont -Brush $White -X 172 -Y 598 -W 540 -H 70

    Draw-Text -Graphics $Graphics -Text ("Frame " + ($Index + 1) + " / " + $Total) -Font $SmallFont -Brush $Cyan -X 138 -Y 820 -W 240 -H 32
    for ($i = 0; $i -lt $Total; $i++) {
      $Fill = if ($i -eq $Index) { $Gold } else { $Cyan }
      $Graphics.FillRectangle($Fill, 138 + ($i * 78), 872, 52, 8)
    }

    $PreviewX = 940
    $PreviewY = 128
    $PreviewW = 820
    $PreviewH = 461
    $Graphics.FillRectangle((New-Brush -A 236 -R 236 -G 249 -B 252), $PreviewX - 18, $PreviewY - 18, $PreviewW + 36, $PreviewH + 36)
    $Graphics.DrawRectangle($GoldPen, $PreviewX - 18, $PreviewY - 18, $PreviewW + 36, $PreviewH + 36)
    if ($Index -eq 0) {
      $Graphics.DrawImage($SourceImage, $PreviewX, $PreviewY, $PreviewW, $PreviewH)
    } else {
      $Graphics.DrawImage($PromoImage, $PreviewX, $PreviewY, $PreviewW, $PreviewH)
    }

    $MiniY = 690
    $MiniW = 250
    $MiniH = 141
    $Graphics.DrawImage($SourceImage, 940, $MiniY, $MiniW, $MiniH)
    $Graphics.DrawImage($PromoImage, 1226, $MiniY, $MiniW, $MiniH)
    $Graphics.DrawImage($SourceImage, 1512, $MiniY, $MiniW, $MiniH)
    $Graphics.DrawRectangle($CyanPen, 940, $MiniY, $MiniW, $MiniH)
    $Graphics.DrawRectangle($CyanPen, 1226, $MiniY, $MiniW, $MiniH)
    $Graphics.DrawRectangle($CyanPen, 1512, $MiniY, $MiniW, $MiniH)

    $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output ("Wrote {0}" -f ($OutputPath.Substring($Root.Length + 1)))
  }
  finally {
    if ($Graphics) {
      $Graphics.Dispose()
    }
    if ($Bitmap) {
      $Bitmap.Dispose()
    }
  }
}

$Page = Read-JsonFile -Path $PagePath
$Promo = $Page.reviewArtifacts.leaderboardPromo
if (-not $Promo -or -not $Promo.trailerFrames) {
  throw "store-page.json is missing leaderboard promo trailer frames"
}

$SourceImage = [System.Drawing.Image]::FromFile((Join-Path $Root $Promo.sourceScreenshot))
$PromoImage = [System.Drawing.Image]::FromFile((Join-Path $Root $Promo.path))

try {
  $Frames = @($Promo.trailerFrames)
  for ($Index = 0; $Index -lt $Frames.Count; $Index++) {
    Draw-Frame -Frame $Frames[$Index] -Index $Index -Total $Frames.Count -SourceImage $SourceImage -PromoImage $PromoImage
  }
}
finally {
  $SourceImage.Dispose()
  $PromoImage.Dispose()
}
