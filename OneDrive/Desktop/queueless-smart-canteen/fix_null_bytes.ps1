# Run this script if you get "Unexpected \x00" errors during npm run build
# This is caused by OneDrive syncing null bytes into files

Write-Host "Fixing null bytes in frontend JSX files..." -ForegroundColor Cyan

$files = Get-ChildItem -Path ".\frontend\src" -Recurse -Include "*.jsx", "*.js", "*.css"
$fixed = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    if ($bytes -contains 0) {
        $clean = $bytes | Where-Object { $_ -ne 0 }
        [System.IO.File]::WriteAllBytes($file.FullName, $clean)
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
        $fixed++
    }
}

if ($fixed -eq 0) {
    Write-Host "No null bytes found — files are clean!" -ForegroundColor Green
} else {
    Write-Host "`n$fixed file(s) fixed. Now run: cd frontend && npm run build" -ForegroundColor Yellow
}
