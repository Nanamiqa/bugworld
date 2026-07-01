param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$manifestPath = Join-Path $Root "desktop\steam\store-assets\store-assets.json"
$manifest = Get-Content -Path $manifestPath -Encoding UTF8 | ConvertFrom-Json
$outputDir = Join-Path $Root "desktop\steam\store-assets\export"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$keyArtPath = Join-Path $Root $manifest.brand.primaryKeyArt
$keyArt = [System.Drawing.Image]::FromFile($keyArtPath)

function New-ArgbColor([int]$a, [int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function New-Font([string]$family, [float]$size, [System.Drawing.FontStyle]$style) {
  try {
    return [System.Drawing.Font]::new($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  } catch {
    return [System.Drawing.Font]::new([System.Drawing.FontFamily]::GenericSansSerif, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  }
}

function Draw-CoverImage($graphics, $image, [int]$width, [int]$height, [float]$shiftX, [float]$shiftY) {
  $scale = [Math]::Max($width / $image.Width, $height / $image.Height)
  $drawWidth = [int][Math]::Ceiling($image.Width * $scale)
  $drawHeight = [int][Math]::Ceiling($image.Height * $scale)
  $x = [int][Math]::Round(($width - $drawWidth) * 0.5 + ($width * $shiftX))
  $y = [int][Math]::Round(($height - $drawHeight) * 0.5 + ($height * $shiftY))
  $graphics.DrawImage($image, $x, $y, $drawWidth, $drawHeight)
}

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Chip($graphics, [string]$text, [float]$x, [float]$y, [float]$fontSize, [float]$scale) {
  $font = New-Font "Microsoft YaHei UI" $fontSize ([System.Drawing.FontStyle]::Bold)
  $size = $graphics.MeasureString($text, $font)
  $padX = 13 * $scale
  $padY = 7 * $scale
  $path = New-RoundedPath $x $y ($size.Width + $padX * 2) ($size.Height + $padY * 1.2) (7 * $scale)
  $brush = [System.Drawing.SolidBrush]::new((New-ArgbColor 52 255 255 255))
  $pen = [System.Drawing.Pen]::new((New-ArgbColor 86 255 255 255), [Math]::Max(1, 1.5 * $scale))
  $textBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 236 255 255 255))
  $graphics.FillPath($brush, $path)
  $graphics.DrawPath($pen, $path)
  $graphics.DrawString($text, $font, $textBrush, ($x + $padX), ($y + $padY * 0.45))
  $width = $size.Width + $padX * 2
  $path.Dispose()
  $brush.Dispose()
  $pen.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
  return $width
}

function Draw-Sigil($graphics, [float]$cx, [float]$cy, [float]$size) {
  $points = @(
    [System.Drawing.PointF]::new($cx, $cy - $size * 0.52),
    [System.Drawing.PointF]::new($cx + $size * 0.52, $cy),
    [System.Drawing.PointF]::new($cx, $cy + $size * 0.52),
    [System.Drawing.PointF]::new($cx - $size * 0.52, $cy)
  )
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.PointF]::new($cx - $size, $cy - $size),
    [System.Drawing.PointF]::new($cx + $size, $cy + $size),
    (New-ArgbColor 238 0 184 169),
    (New-ArgbColor 228 240 111 124)
  )
  $pen = [System.Drawing.Pen]::new((New-ArgbColor 210 255 255 255), [Math]::Max(2, $size * 0.035))
  $innerPen = [System.Drawing.Pen]::new((New-ArgbColor 152 255 209 102), [Math]::Max(1, $size * 0.018))
  $graphics.FillPolygon($brush, $points)
  $graphics.DrawPolygon($pen, $points)
  $graphics.DrawLine($innerPen, $cx - $size * 0.22, $cy, $cx + $size * 0.22, $cy)
  $graphics.DrawLine($innerPen, $cx, $cy - $size * 0.22, $cx, $cy + $size * 0.22)
  $brush.Dispose()
  $pen.Dispose()
  $innerPen.Dispose()
}

function Draw-Overlay($graphics, [int]$width, [int]$height, [bool]$deep) {
  $overlayAlpha = if ($deep) { 120 } else { 70 }
  $overlayBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($width, 0),
    (New-ArgbColor 226 8 16 31),
    (New-ArgbColor $overlayAlpha 8 16 31)
  )
  $graphics.FillRectangle($overlayBrush, 0, 0, $width, $height)
  $overlayBrush.Dispose()

  $warmBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($width, $height),
    (New-ArgbColor 0 255 255 255),
    (New-ArgbColor 54 240 111 124)
  )
  $graphics.FillRectangle($warmBrush, 0, 0, $width, $height)
  $warmBrush.Dispose()

  $linePen = [System.Drawing.Pen]::new((New-ArgbColor 24 255 255 255), [Math]::Max(1, $width * 0.0012))
  $step = [Math]::Max(18, [int]($height / 24))
  for ($y = 0; $y -lt $height; $y += $step) {
    $graphics.DrawLine($linePen, 0, $y, $width, $y)
  }
  $linePen.Dispose()

  $borderPen = [System.Drawing.Pen]::new((New-ArgbColor 82 255 255 255), [Math]::Max(2, $width * 0.0025))
  $marginX = [int]($width * 0.046)
  $marginY = [int]($height * 0.054)
  $graphics.DrawRectangle($borderPen, $marginX, $marginY, $width - $marginX * 2, $height - $marginY * 2)
  $borderPen.Dispose()
}

function Draw-Lockup($graphics, $asset, [int]$width, [int]$height) {
  $scale = $width / 920.0
  if ($asset.layout -eq "vertical") {
    $scale = $width / 600.0
  }
  if ($asset.layout -eq "hero") {
    $scale = $width / 2200.0
  }

  $left = $width * $asset.left
  $top = $height * $asset.top
  $maxTextWidth = $width * $asset.textWidth

  if ($asset.showMark) {
    $markFont = New-Font "Segoe UI" ([Math]::Max(12, $asset.markSize * $scale)) ([System.Drawing.FontStyle]::Bold)
    $markBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 255 209 102))
    Draw-Sigil $graphics ($left + 10 * $scale) ($top + 10 * $scale) (20 * $scale)
    $graphics.DrawString($asset.mark, $markFont, $markBrush, ($left + 31 * $scale), ($top - 2 * $scale))
    $top += 42 * $scale
    $markBrush.Dispose()
    $markFont.Dispose()
  }

  $titleFont = New-Font "Microsoft YaHei UI" ([Math]::Max(28, $asset.titleSize * $scale)) ([System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Font "Microsoft YaHei UI" ([Math]::Max(13, $asset.subtitleSize * $scale)) ([System.Drawing.FontStyle]::Bold)
  $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $softWhite = [System.Drawing.SolidBrush]::new((New-ArgbColor 226 255 255 255))
  $shadow = [System.Drawing.SolidBrush]::new((New-ArgbColor 118 0 0 0))
  $format = [System.Drawing.StringFormat]::new()
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::LineLimit

  $titleRect = [System.Drawing.RectangleF]::new($left + 3 * $scale, $top + 4 * $scale, $maxTextWidth, $asset.titleBoxHeight * $scale)
  $graphics.DrawString($asset.title, $titleFont, $shadow, $titleRect, $format)
  $titleRect.X -= 3 * $scale
  $titleRect.Y -= 4 * $scale
  $graphics.DrawString($asset.title, $titleFont, $white, $titleRect, $format)

  $subtitleRect = [System.Drawing.RectangleF]::new($left, $top + $asset.subtitleTop * $scale, $maxTextWidth, $asset.subtitleBoxHeight * $scale)
  $graphics.DrawString($asset.subtitle, $subtitleFont, $softWhite, $subtitleRect, $format)

  if ($asset.chips.Count -gt 0) {
    $x = $width * $asset.chipLeft
    $y = $height * $asset.chipTop
    foreach ($chip in $asset.chips) {
      $chipWidth = Draw-Chip $graphics $chip $x $y ([Math]::Max(10, $asset.chipSize * $scale)) $scale
      $x += $chipWidth + 9 * $scale
    }
  }

  if ($asset.showSigil) {
    Draw-Sigil $graphics ($width * $asset.sigilX) ($height * $asset.sigilY) ($width * $asset.sigilSize)
  }

  $format.Dispose()
  $white.Dispose()
  $softWhite.Dispose()
  $shadow.Dispose()
  $titleFont.Dispose()
  $subtitleFont.Dispose()
}

function Export-Capsule($capsule, $asset, $image) {
  $width = [int]$capsule.width
  $height = [int]$capsule.height
  $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  if ($asset.layout -eq "icon") {
    $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      [System.Drawing.Point]::new(0, 0),
      [System.Drawing.Point]::new($width, $height),
      (New-ArgbColor 255 21 34 56),
      (New-ArgbColor 255 240 111 124)
    )
    $graphics.FillRectangle($background, 0, 0, $width, $height)
    $background.Dispose()
    Draw-Sigil $graphics ($width / 2) ($height / 2) ($width * 0.58)
  } else {
    Draw-CoverImage $graphics $image $width $height $asset.shiftX $asset.shiftY
    Draw-Overlay $graphics $width $height $asset.deepOverlay
    Draw-Lockup $graphics $asset $width $height
  }

  $outputPath = Join-Path $Root $capsule.plannedOutput
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  Write-Output "Exported $($capsule.id) -> $($capsule.plannedOutput) ($width x $height)"
}

$assets = @{
  header_capsule = @{
    layout = "wide"; shiftX = 0.08; shiftY = 0; deepOverlay = $false; showMark = $true; mark = "URBAN ANOMALY ROGUELITE"; markSize = 16; title = $manifest.brand.zhCN; subtitle = $manifest.brand.taglineZhCN; titleSize = 72; subtitleSize = 22; titleBoxHeight = 80; subtitleTop = 92; subtitleBoxHeight = 68; left = 0.07; top = 0.105; textWidth = 0.58; chips = @("Five Chapters", "Concept Resonance", "Boss Mechanics"); chipLeft = 0.07; chipTop = 0.77; chipSize = 14; showSigil = $true; sigilX = 0.86; sigilY = 0.78; sigilSize = 0.16
  }
  small_capsule = @{
    layout = "wide"; shiftX = 0.07; shiftY = 0; deepOverlay = $true; showMark = $false; mark = ""; markSize = 0; title = $manifest.brand.zhCN; subtitle = $manifest.brand.enUS; titleSize = 84; subtitleSize = 30; titleBoxHeight = 54; subtitleTop = 58; subtitleBoxHeight = 34; left = 0.06; top = 0.15; textWidth = 0.78; chips = @(); chipLeft = 0; chipTop = 0; chipSize = 0; showSigil = $false; sigilX = 0; sigilY = 0; sigilSize = 0
  }
  main_capsule = @{
    layout = "wide"; shiftX = 0.08; shiftY = 0; deepOverlay = $false; showMark = $true; mark = "DEBUG THE RULES ENGINE"; markSize = 18; title = $manifest.brand.zhCN; subtitle = $manifest.brand.taglineZhCN; titleSize = 78; subtitleSize = 24; titleBoxHeight = 92; subtitleTop = 104; subtitleBoxHeight = 92; left = 0.07; top = 0.11; textWidth = 0.57; chips = @("Action Roguelite", "Story Twists", "Steam Deck Ready"); chipLeft = 0.07; chipTop = 0.78; chipSize = 14; showSigil = $true; sigilX = 0.84; sigilY = 0.79; sigilSize = 0.16
  }
  vertical_capsule = @{
    layout = "vertical"; shiftX = 0.03; shiftY = 0; deepOverlay = $false; showMark = $true; mark = "VARIABLE CITY"; markSize = 17; title = $manifest.brand.zhCN; subtitle = $manifest.brand.taglineZhCN; titleSize = 78; subtitleSize = 21; titleBoxHeight = 168; subtitleTop = 176; subtitleBoxHeight = 104; left = 0.08; top = 0.08; textWidth = 0.78; chips = @("Five Chapters", "Many Builds"); chipLeft = 0.08; chipTop = 0.82; chipSize = 15; showSigil = $true; sigilX = 0.76; sigilY = 0.66; sigilSize = 0.17
  }
  library_capsule = @{
    layout = "vertical"; shiftX = 0.04; shiftY = 0; deepOverlay = $false; showMark = $true; mark = "NIGHTWATCH"; markSize = 17; title = $manifest.brand.zhCN; subtitle = "Debug anomalies. Stack blessings. Save the city."; titleSize = 78; subtitleSize = 20; titleBoxHeight = 164; subtitleTop = 176; subtitleBoxHeight = 104; left = 0.08; top = 0.08; textWidth = 0.8; chips = @("Roguelite", "Story"); chipLeft = 0.08; chipTop = 0.83; chipSize = 15; showSigil = $true; sigilX = 0.76; sigilY = 0.66; sigilSize = 0.18
  }
  library_hero = @{
    layout = "hero"; shiftX = 0.08; shiftY = 0; deepOverlay = $false; showMark = $true; mark = "PUBLIC RULES ENGINE ONLINE"; markSize = 24; title = $manifest.brand.zhCN; subtitle = $manifest.brand.taglineEnUS; titleSize = 120; subtitleSize = 33; titleBoxHeight = 170; subtitleTop = 188; subtitleBoxHeight = 118; left = 0.05; top = 0.16; textWidth = 0.48; chips = @("Five Chapters", "Build Synergies", "Readable Boss Mechanics"); chipLeft = 0.05; chipTop = 0.78; chipSize = 15; showSigil = $true; sigilX = 0.82; sigilY = 0.66; sigilSize = 0.1
  }
  community_icon = @{
    layout = "icon"
  }
}

try {
  foreach ($capsule in $manifest.capsules) {
    Export-Capsule $capsule $assets[$capsule.id] $keyArt
  }
} finally {
  $keyArt.Dispose()
}
