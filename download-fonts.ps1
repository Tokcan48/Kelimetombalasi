# Font İndirme Scripti
# Bu script DejaVu Sans fontlarını public/fonts/ klasörüne indirir

Write-Host "Fontlar indiriliyor..." -ForegroundColor Green

$fontsDir = "public\fonts"
if (-not (Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null
    Write-Host "public/fonts klasörü oluşturuldu" -ForegroundColor Yellow
}

# jsDelivr CDN üzerinden indir
$fonts = @(
    @{
        Name = "DejaVuSans-Bold.ttf"
        Url = "https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans-Bold.ttf"
    },
    @{
        Name = "DejaVuSans.ttf"
        Url = "https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans.ttf"
    }
)

foreach ($font in $fonts) {
    $filePath = Join-Path $fontsDir $font.Name
    try {
        Write-Host "İndiriliyor: $($font.Name)..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $font.Url -OutFile $filePath -TimeoutSec 120
        $fileSize = (Get-Item $filePath).Length / 1KB
        Write-Host "OK: $($font.Name) indirildi ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
    }
    catch {
        Write-Host "HATA: $($font.Name) indirilemedi: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Font indirme islemi tamamlandi!" -ForegroundColor Green

