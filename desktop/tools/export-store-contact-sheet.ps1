$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$ManifestPath = Join-Path $Root "desktop\steam\store-assets\store-assets.json"
$PagePath = Join-Path $Root "desktop\steam\store-assets\store-page.json"

function Read-JsonFile {
  param([string]$Path)
  $Text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  return $Text | ConvertFrom-Json
}

$Manifest = Read-JsonFile -Path $ManifestPath
$Page = Read-JsonFile -Path $PagePath
$Sheet = $Page.reviewArtifacts.contactSheet
$OutputPath = Join-Path $Root $Sheet.path
$OutputDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$Screenshots = @{}
foreach ($Screenshot in $Manifest.screenshots) {
  $Screenshots[$Screenshot.id] = $Screenshot
}

$Width = [int]$Sheet.width
$Height = [int]$Sheet.height
$Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Images = New-Object "System.Collections.Generic.List[System.Drawing.Image]"

try {
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.Clear([System.Drawing.Color]::FromArgb(14, 18, 24))

  $TitleFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 34, [System.Drawing.FontStyle]::Bold)
  $SubFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)
  $LabelFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)
  $NoteFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
  $TitleBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(244, 248, 255))
  $SubBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(172, 188, 205))
  $CardBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(28, 35, 45))
  $BorderPen = New-Object System.Drawing.Pen -ArgumentList @(([System.Drawing.Color]::FromArgb(84, 204, 214)), 2)
  $RankBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::FromArgb(249, 192, 79))

  $Graphics.DrawString("Variable City Nightwatch - Steam Screenshot Review", $TitleFont, $TitleBrush, 48, 28)
  $Graphics.DrawString("Final page order: combat hook, map variety, build depth, late chapter scale, meta, PC settings.", $SubFont, $SubBrush, 52, 76)

  $Columns = 3
  $Rows = 2
  $MarginX = 48
  $Top = 122
  $GutterX = 24
  $GutterY = 30
  $CellW = [math]::Floor(($Width - ($MarginX * 2) - ($GutterX * ($Columns - 1))) / $Columns)
  $CellH = [math]::Floor(($Height - $Top - 44 - ($GutterY * ($Rows - 1))) / $Rows)
  $ImageH = [math]::Floor($CellW * 9 / 16)

  for ($Index = 0; $Index -lt $Page.screenshotOrder.Count; $Index++) {
    $Entry = $Page.screenshotOrder[$Index]
    if (-not $Screenshots.ContainsKey($Entry.id)) {
      throw "Unknown screenshot id: $($Entry.id)"
    }

    $Screenshot = $Screenshots[$Entry.id]
    $SourcePath = Join-Path $Root $Screenshot.targetFile
    if (-not (Test-Path -LiteralPath $SourcePath)) {
      throw "Missing screenshot file: $($Screenshot.targetFile)"
    }

    $Image = [System.Drawing.Image]::FromFile($SourcePath)
    $null = $Images.Add($Image)

    $Column = $Index % $Columns
    $Row = [math]::Floor($Index / $Columns)
    $X = $MarginX + ($Column * ($CellW + $GutterX))
    $Y = $Top + ($Row * ($CellH + $GutterY))

    $Graphics.FillRectangle($CardBrush, $X, $Y, $CellW, $CellH)
    $Graphics.DrawRectangle($BorderPen, $X, $Y, $CellW, $CellH)
    $Graphics.DrawImage($Image, $X, $Y, $CellW, $ImageH)

    $Label = ("#{0} {1}" -f $Entry.rank, $Entry.role)
    $IdLabel = $Entry.id
    $Graphics.DrawString($Label, $LabelFont, $RankBrush, ($X + 14), ($Y + $ImageH + 14))
    $Graphics.DrawString($IdLabel, $NoteFont, $SubBrush, ($X + 14), ($Y + $ImageH + 42))
  }

  $Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output ("Wrote {0}" -f $Sheet.path)
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
