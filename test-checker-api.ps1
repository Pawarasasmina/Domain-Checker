# PowerShell Test Script for Checker API
# Run this to test the integration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checker API Integration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$dashboardUrl = "http://localhost:5000/api/urls"

# Test 1: Get all domains
Write-Host "Test 1: GET /api/urls" -ForegroundColor Yellow
Write-Host "Fetching domains..." -ForegroundColor Gray

try {
    $domains = Invoke-RestMethod -Uri $dashboardUrl -Method Get
    Write-Host "SUCCESS - Got $($domains.Count) domains:" -ForegroundColor Green
    $domains | Format-Table -Property id, brand, Domain, noto -AutoSize
    
    if ($domains.Count -eq 0) {
        Write-Host "WARNING: No domains found. Add domains in the dashboard first!" -ForegroundColor Yellow
        exit
    }
    
    # Test 2: Update to blocked
    $testDomain = $domains[0]
    Write-Host ""
    Write-Host "Test 2: POST /api/urls/update (blocked)" -ForegroundColor Yellow
    Write-Host "Testing with: $($testDomain.Domain)" -ForegroundColor Gray
    
    $blockedBody = @{
        id = $testDomain.id
        brand = $testDomain.brand
        Domain = $testDomain.Domain
        noto = $testDomain.noto
        scanResult = @{
            status = "blocked"
        }
    } | ConvertTo-Json
    
    $blockedResult = Invoke-RestMethod -Uri "$dashboardUrl/update" -Method Post -Body $blockedBody -ContentType "application/json"
    Write-Host "SUCCESS - Domain marked as BLOCKED" -ForegroundColor Green
    Write-Host "Nawala status: $($blockedResult.data.nawala.status)" -ForegroundColor Red
    
    # Wait 2 seconds
    Write-Host ""
    Write-Host "Waiting 2 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
    
    # Test 3: Update to accessible
    Write-Host ""
    Write-Host "Test 3: POST /api/urls/update (accessible)" -ForegroundColor Yellow
    Write-Host "Testing with: $($testDomain.Domain)" -ForegroundColor Gray
    
    $accessibleBody = @{
        id = $testDomain.id
        brand = $testDomain.brand
        Domain = $testDomain.Domain
        noto = $testDomain.noto
        scanResult = @{
            status = "accessible"
        }
    } | ConvertTo-Json
    
    $accessibleResult = Invoke-RestMethod -Uri "$dashboardUrl/update" -Method Post -Body $accessibleBody -ContentType "application/json"
    Write-Host "SUCCESS - Domain marked as ACCESSIBLE" -ForegroundColor Green
    Write-Host "Nawala status: $($accessibleResult.data.nawala.status)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  All Tests Passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check dashboard frontend - Nawala column should show updates" -ForegroundColor White
    Write-Host "2. Your checker system is ready to integrate!" -ForegroundColor White
    Write-Host "3. See CHECKER_SETUP.md for integration guide" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure backend is running: cd backend; npm run dev" -ForegroundColor White
    Write-Host "2. Check if MongoDB is running" -ForegroundColor White
    Write-Host "3. Add domains in the dashboard first" -ForegroundColor White
    Write-Host "4. Verify backend is on port 5000" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
