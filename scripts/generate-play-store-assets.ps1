param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$brandDirectory = Join-Path $ProjectRoot 'assets\brand'
$storeDirectory = Join-Path $ProjectRoot 'assets\store'
$iconSource = Join-Path $brandDirectory 'app-icon.png'
$markSource = Join-Path $brandDirectory 'brand-mark.png'
$iconOutput = Join-Path $storeDirectory 'play-icon-512.png'
$featureOutput = Join-Path $storeDirectory 'feature-graphic-tr-1024x500.png'

New-Item -ItemType Directory -Path $storeDirectory -Force | Out-Null

function New-Color([string]$hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-RoundedPath(
  [System.Drawing.RectangleF]$rectangle,
  [float]$radius
) {
  $diameter = $radius * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($rectangle.X, $rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rectangle.Right - $diameter, $rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc(
    $rectangle.Right - $diameter,
    $rectangle.Bottom - $diameter,
    $diameter,
    $diameter,
    0,
    90
  )
  $path.AddArc($rectangle.X, $rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$sourceIcon = [System.Drawing.Image]::FromFile($iconSource)
try {
  $icon = [System.Drawing.Bitmap]::new(512, 512)
  $icon.SetResolution(96, 96)
  $iconGraphics = [System.Drawing.Graphics]::FromImage($icon)
  try {
    $iconGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $iconGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $iconGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $iconGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $iconGraphics.DrawImage($sourceIcon, 0, 0, 512, 512)
    $icon.Save($iconOutput, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $iconGraphics.Dispose()
    $icon.Dispose()
  }
}
finally {
  $sourceIcon.Dispose()
}

$feature = [System.Drawing.Bitmap]::new(1024, 500)
$feature.SetResolution(96, 96)
$graphics = [System.Drawing.Graphics]::FromImage($feature)
try {
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $canvas = [System.Drawing.Rectangle]::new(0, 0, 1024, 500)
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $canvas,
    (New-Color '#06142D'),
    (New-Color '#102B4B'),
    12
  )
  $graphics.FillRectangle($background, $canvas)
  $background.Dispose()

  $tealGlow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(28, 31, 211, 197))
  $coralGlow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(22, 255, 111, 97))
  $graphics.FillEllipse($tealGlow, 790, 270, 390, 390)
  $graphics.FillEllipse($coralGlow, 850, -150, 260, 260)
  $tealGlow.Dispose()
  $coralGlow.Dispose()

  $markPanelRectangle = [System.Drawing.RectangleF]::new(54, 74, 326, 352)
  $markPanelPath = New-RoundedPath $markPanelRectangle 34
  $markPanelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(128, 4, 14, 36))
  $markPanelPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(80, 41, 211, 197), 2)
  $graphics.FillPath($markPanelBrush, $markPanelPath)
  $graphics.DrawPath($markPanelPen, $markPanelPath)
  $markPanelBrush.Dispose()
  $markPanelPen.Dispose()
  $markPanelPath.Dispose()

  $mark = [System.Drawing.Image]::FromFile($markSource)
  try {
    $graphics.DrawImage($mark, 80, 99, 274, 274)
  }
  finally {
    $mark.Dispose()
  }

  $white = [System.Drawing.SolidBrush]::new((New-Color '#F6FAFF'))
  $muted = [System.Drawing.SolidBrush]::new((New-Color '#B8C8D8'))
  $accent = [System.Drawing.SolidBrush]::new((New-Color '#29D3C5'))
  $titleFont = [System.Drawing.Font]::new('Segoe UI', 48, [System.Drawing.FontStyle]::Bold)
  $taglineFont = [System.Drawing.Font]::new('Segoe UI', 25, [System.Drawing.FontStyle]::Regular)
  $eyebrowFont = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
  $detailFont = [System.Drawing.Font]::new('Segoe UI', 16, [System.Drawing.FontStyle]::Regular)

  $eyebrowText = 'AKILLI MAL' + [char]0x0130 + 'YET KARARLARI'
  $taglineText = 'Ger' + [char]0x00E7 + 'ek maliyeti g' + [char]0x00F6 + 'r' + [char]0x00FC + 'n.'
  $detailText =
    'Toplam maliyet  ' +
    [char]0x2022 +
    '  Senaryolar  ' +
    [char]0x2022 +
    '  Kar' +
    [char]0x015F +
    [char]0x0131 +
    'la' +
    [char]0x015F +
    't' +
    [char]0x0131 +
    'rma'

  $graphics.DrawString($eyebrowText, $eyebrowFont, $accent, 430, 103)
  $graphics.DrawString('Hidden Cost', $titleFont, $white, 423, 139)
  $graphics.DrawString($taglineText, $taglineFont, $muted, 430, 215)

  $pillRectangle = [System.Drawing.RectangleF]::new(430, 294, 500, 62)
  $pillPath = New-RoundedPath $pillRectangle 18
  $pillBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(115, 13, 42, 67))
  $pillPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(95, 41, 211, 197), 1)
  $graphics.FillPath($pillBrush, $pillPath)
  $graphics.DrawPath($pillPen, $pillPath)
  $graphics.DrawString($detailText, $detailFont, $white, 455, 313)

  $pillBrush.Dispose()
  $pillPen.Dispose()
  $pillPath.Dispose()
  $white.Dispose()
  $muted.Dispose()
  $accent.Dispose()
  $titleFont.Dispose()
  $taglineFont.Dispose()
  $eyebrowFont.Dispose()
  $detailFont.Dispose()

  $feature.Save($featureOutput, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $feature.Dispose()
}

Write-Output $iconOutput
Write-Output $featureOutput
