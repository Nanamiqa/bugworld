$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$PagePath = Join-Path $Root "desktop\steam\store-assets\store-page.json"

function Read-JsonFile {
  param([string]$Path)
  $Text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  return $Text | ConvertFrom-Json
}

function New-Color {
  param([string]$Hex, [int]$Alpha = 255)
  $Value = $Hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    $Alpha,
    [Convert]::ToInt32($Value.Substring(0, 2), 16),
    [Convert]::ToInt32($Value.Substring(2, 2), 16),
    [Convert]::ToInt32($Value.Substring(4, 2), 16)
  )
}

function New-Brush {
  param([string]$Hex, [int]$Alpha = 255)
  return New-Object System.Drawing.SolidBrush (New-Color -Hex $Hex -Alpha $Alpha)
}

function Draw-TextBox {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height
  )
  $Format = New-Object System.Drawing.StringFormat
  $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
  $Format.FormatFlags = [System.Drawing.StringFormatFlags]::NoClip
  $Rect = New-Object System.Drawing.RectangleF $X, $Y, $Width, $Height
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
}

function Draw-RoundedRect {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.Pen]$Pen,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height
  )
  $Graphics.FillRectangle($Brush, $X, $Y, $Width, $Height)
  if ($Pen) {
    $Graphics.DrawRectangle($Pen, $X, $Y, $Width, $Height)
  }
}

function Draw-FrameCard {
  param(
    [System.Drawing.Graphics]$Graphics,
    [object]$Frame,
    [int]$Index,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$ImageHeight,
    [System.Drawing.Font]$TimeFont,
    [System.Drawing.Font]$TitleFont,
    [System.Drawing.Font]$NoteFont,
    [System.Drawing.Brush]$WhiteBrush,
    [System.Drawing.Brush]$DimBrush,
    [System.Drawing.Brush]$AccentBrush,
    [System.Drawing.Pen]$AccentPen
  )
  $Path = Join-Path $Root $Frame.path
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Missing opening rush clip frame: $($Frame.path)"
  }

  $Source = [System.Drawing.Image]::FromFile($Path)
  try {
    $CardBrush = New-Brush -Hex "#101c2b" -Alpha 238
    Draw-RoundedRect -Graphics $Graphics -Brush $CardBrush -Pen $AccentPen -X $X -Y $Y -Width $Width -Height ($ImageHeight + 88)
    $Graphics.DrawImage($Source, $X + 10, $Y + 10, $Width - 20, $ImageHeight - 12)
    $Graphics.FillRectangle((New-Brush -Hex "#08121e" -Alpha 205), $X + 10, $Y + $ImageHeight - 44, $Width - 20, 42)
    $Seconds = [Math]::Round(([double]$Frame.captureAtMs) / 1000, 1)
    $Graphics.DrawString(("{0:00} | {1:0.0}s" -f ($Index + 1), $Seconds), $TimeFont, $AccentBrush, $X + 22, $Y + $ImageHeight - 35)
    $Graphics.DrawString([string]$Frame.beat, $TitleFont, $WhiteBrush, $X + 112, $Y + $ImageHeight - 38)
    Draw-TextBox -Graphics $Graphics -Text ([string]$Frame.noteZhCN) -Font $NoteFont -Brush $DimBrush -X ($X + 22) -Y ($Y + $ImageHeight + 8) -Width ($Width - 44) -Height 56
    $CardBrush.Dispose()
  }
  finally {
    $Source.Dispose()
  }
}

$Page = Read-JsonFile -Path $PagePath
$Board = $Page.reviewArtifacts.openingRushTrailerBoard
$Sheet = $Board.reviewSheet
if (-not $Sheet) {
  throw "store-page.json is missing reviewArtifacts.openingRushTrailerBoard.reviewSheet"
}

$OutputPath = Join-Path $Root $Sheet.path
$OutputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Bitmap = New-Object System.Drawing.Bitmap ([int]$Sheet.width), ([int]$Sheet.height)
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$WhiteBrush = New-Brush -Hex "#f8fcff"
$DimBrush = New-Brush -Hex "#b9c9d8"
$MutedBrush = New-Brush -Hex "#7e8fa4"
$AccentBrush = New-Brush -Hex "#f1c15b"
$CyanBrush = New-Brush -Hex "#5de2d1"
$BgBrush = New-Brush -Hex "#07111f"
$PanelBrush = New-Brush -Hex "#0d1928" -Alpha 245
$AccentPen = New-Object System.Drawing.Pen (New-Color -Hex "#5de2d1"), 2
$GoldPen = New-Object System.Drawing.Pen (New-Color -Hex "#f1c15b"), 3

$TitleFont = New-Object System.Drawing.Font "Microsoft YaHei", 42, ([System.Drawing.FontStyle]::Bold)
$SubFont = New-Object System.Drawing.Font "Microsoft YaHei", 18, ([System.Drawing.FontStyle]::Bold)
$SmallFont = New-Object System.Drawing.Font "Microsoft YaHei", 13, ([System.Drawing.FontStyle]::Regular)
$TimeFont = New-Object System.Drawing.Font "Microsoft YaHei", 15, ([System.Drawing.FontStyle]::Bold)
$FrameTitleFont = New-Object System.Drawing.Font "Microsoft YaHei", 19, ([System.Drawing.FontStyle]::Bold)
$NoteFont = New-Object System.Drawing.Font "Microsoft YaHei", 13, ([System.Drawing.FontStyle]::Regular)
$MetricFont = New-Object System.Drawing.Font "Microsoft YaHei", 26, ([System.Drawing.FontStyle]::Bold)

try {
  $Graphics.FillRectangle($BgBrush, 0, 0, [int]$Sheet.width, [int]$Sheet.height)
  $Graphics.FillRectangle((New-Brush -Hex "#102338" -Alpha 180), 0, 0, [int]$Sheet.width, 150)
  $Graphics.DrawString("Opening Rush Clip Review", $TitleFont, $WhiteBrush, 56, 38)
  $Graphics.DrawString("6.3s real gameplay GIF: anomaly -> rift landing -> first strike -> S rank -> retry hook", $SubFont, $DimBrush, 62, 102)

  $Clip = $Board.animatedClip
  $MetricX = 1330
  $MetricY = 34
  $Metrics = @(
    @{ Label = "Duration"; Value = ("{0:0.0}s" -f [double]$Clip.durationSeconds) },
    @{ Label = "Frames"; Value = ($Board.captureFrames.Count.ToString()) },
    @{ Label = "GIF"; Value = ("{0}x{1}" -f $Clip.width, $Clip.height) }
  )
  foreach ($Metric in $Metrics) {
    $Graphics.FillRectangle((New-Brush -Hex "#f1c15b" -Alpha 28), $MetricX, $MetricY, 168, 78)
    $Graphics.DrawRectangle($GoldPen, $MetricX, $MetricY, 168, 78)
    $Graphics.DrawString($Metric.Label, $SmallFont, $AccentBrush, $MetricX + 16, $MetricY + 12)
    $Graphics.DrawString($Metric.Value, $MetricFont, $WhiteBrush, $MetricX + 16, $MetricY + 36)
    $MetricX += 184
  }

  $Frames = @($Board.captureFrames)
  $CardW = 420
  $ImgH = 236
  $Gap = 28
  for ($Index = 0; $Index -lt 4; $Index++) {
    Draw-FrameCard -Graphics $Graphics -Frame $Frames[$Index] -Index $Index -X (56 + $Index * ($CardW + $Gap)) -Y 180 -Width $CardW -ImageHeight $ImgH -TimeFont $TimeFont -TitleFont $FrameTitleFont -NoteFont $NoteFont -WhiteBrush $WhiteBrush -DimBrush $DimBrush -AccentBrush $AccentBrush -AccentPen $AccentPen
  }
  for ($Index = 4; $Index -lt 7; $Index++) {
    Draw-FrameCard -Graphics $Graphics -Frame $Frames[$Index] -Index $Index -X (56 + ($Index - 4) * ($CardW + $Gap)) -Y 548 -Width $CardW -ImageHeight $ImgH -TimeFont $TimeFont -TitleFont $FrameTitleFont -NoteFont $NoteFont -WhiteBrush $WhiteBrush -DimBrush $DimBrush -AccentBrush $AccentBrush -AccentPen $AccentPen
  }

  $ReviewX = 1428
  $ReviewY = 548
  $ReviewW = 436
  $ReviewH = 358
  Draw-RoundedRect -Graphics $Graphics -Brush $PanelBrush -Pen $GoldPen -X $ReviewX -Y $ReviewY -Width $ReviewW -Height $ReviewH
  $Graphics.DrawString("Shareability Review", $FrameTitleFont, $AccentBrush, $ReviewX + 26, $ReviewY + 30)
  Draw-TextBox -Graphics $Graphics -Text ([string]$Sheet.verdictZhCN) -Font $SubFont -Brush $WhiteBrush -X ($ReviewX + 26) -Y ($ReviewY + 70) -Width ($ReviewW - 52) -Height 76
  $CheckY = $ReviewY + 166
  foreach ($Check in $Sheet.checks) {
    $Graphics.FillEllipse($CyanBrush, $ReviewX + 28, $CheckY + 7, 10, 10)
    $Graphics.DrawString([string]$Check, $SubFont, $DimBrush, $ReviewX + 52, $CheckY - 2)
    $CheckY += 38
  }

  $Graphics.FillRectangle((New-Brush -Hex "#5de2d1" -Alpha 34), 56, 950, 1808, 76)
  $Graphics.DrawString("Next: before exporting WebM/MP4, tune text density and camera focus from this review sheet.", $SubFont, $WhiteBrush, 84, 974)
  $Graphics.DrawString("Source: opening-rush-trailer-clip.gif / storeShot=opening-rush-trailer&clip=1", $SmallFont, $MutedBrush, 84, 1005)

  $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output ("Wrote {0}" -f ($OutputPath.Substring($Root.Length + 1)))
}
finally {
  $Graphics.Dispose()
  $Bitmap.Dispose()
  $WhiteBrush.Dispose()
  $DimBrush.Dispose()
  $MutedBrush.Dispose()
  $AccentBrush.Dispose()
  $CyanBrush.Dispose()
  $BgBrush.Dispose()
  $PanelBrush.Dispose()
  $AccentPen.Dispose()
  $GoldPen.Dispose()
  $TitleFont.Dispose()
  $SubFont.Dispose()
  $SmallFont.Dispose()
  $TimeFont.Dispose()
  $FrameTitleFont.Dispose()
  $NoteFont.Dispose()
  $MetricFont.Dispose()
}
