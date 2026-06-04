$dir = 'c:\Users\Somic\OneDrive\Desktop\project\example\destinations'
$files = Get-ChildItem -Path $dir -Filter '*.html'

$btnHtml = '<button class="bm-trigger" onclick="void(0)" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:14px 36px;border-radius:10px;font-family:inherit;font-size:1rem;font-weight:700;letter-spacing:0.5px;cursor:pointer;box-shadow:0 6px 20px rgba(16,185,129,0.35);">Book Now</button>'
$scriptTag = '  <script src="booking-modal.js"></script>'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Replace the anchor Book Now link with a button
    $content = $content -replace '<a href="\.\./contact\.html">Book Now</a>', $btnHtml

    # Inject script tag before </body> if not already present
    if ($content -notmatch 'booking-modal\.js') {
        $content = $content -replace '</body>', "$scriptTag`n</body>"
    }

    Set-Content $file.FullName -Value $content -Encoding UTF8
    Write-Host "Patched: $($file.Name)"
}
Write-Host "All done."
