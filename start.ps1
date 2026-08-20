<#
.SYNOPSIS
    Starts both halves of StreamPlatform: the Spring Boot API (:8080) and the Vite dev server (:3000).

.DESCRIPTION
    Each service runs in its own window so their logs stay readable. This script waits
    until you press Ctrl+C (or close it), then shuts both services back down.

.PARAMETER BackendOnly
    Start only the Spring Boot API.

.PARAMETER FrontendOnly
    Start only the Vite dev server (assumes the API is already running).

.PARAMETER SkipInstall
    Skip "npm install" even when node_modules is missing.

.EXAMPLE
    .\start.ps1
#>
[CmdletBinding()]
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

$root     = $PSScriptRoot
$backend  = Join-Path $root 'StreamPlatformNew'
$frontend = Join-Path $root 'FrontForStreamPlatform'
$started  = @()

function Write-Step($message) { Write-Host "==> $message" -ForegroundColor Cyan }
function Write-Warn($message) { Write-Host "!!  $message" -ForegroundColor Yellow }

function Assert-Command($name, $hint) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($null -eq $cmd) { throw "'$name' was not found on PATH. $hint" }
}

function Wait-ForPort($port, $label, $timeoutSeconds = 120) {
    Write-Step "Waiting for $label on port $port ..."
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($conn) { Write-Step "$label is up (http://localhost:$port)"; return $true }
        Start-Sleep -Seconds 1
    }
    Write-Warn "$label did not open port $port within $timeoutSeconds seconds - check its window."
    return $false
}

function Test-PortBusy($port) {
    $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

$runBackend  = -not $FrontendOnly
$runFrontend = -not $BackendOnly

try {
    if ($runBackend) {
        Assert-Command 'java' 'Install Java 17 (https://adoptium.net) and reopen your terminal.'
        if (Test-PortBusy 8080) {
            Write-Warn 'Port 8080 is already in use - skipping the backend (something is already serving it).'
        }
        else {
            Write-Step 'Starting the Spring Boot API (StreamPlatformNew) ...'
            $mvnw = Join-Path $backend 'mvnw.cmd'
            $started += Start-Process -FilePath $mvnw -ArgumentList 'spring-boot:run' `
                -WorkingDirectory $backend -PassThru
            Wait-ForPort 8080 'the API' | Out-Null
        }
    }

    if ($runFrontend) {
        Assert-Command 'npm' 'Install Node.js 18+ (https://nodejs.org) and reopen your terminal.'
        if (Test-PortBusy 3000) {
            Write-Warn 'Port 3000 is already in use - skipping the frontend.'
        }
        else {
            if (-not $SkipInstall -and -not (Test-Path (Join-Path $frontend 'node_modules'))) {
                Write-Step 'Installing frontend dependencies (npm install) ...'
                Push-Location $frontend
                try { & npm install } finally { Pop-Location }
                if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE." }
            }

            Write-Step 'Starting the Vite dev server (FrontForStreamPlatform) ...'
            $started += Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm', 'run', 'dev' `
                -WorkingDirectory $frontend -PassThru
            Wait-ForPort 3000 'the app' | Out-Null
        }
    }

    if ($started.Count -eq 0) {
        Write-Warn 'Nothing was started.'
        return
    }

    Write-Host ''
    Write-Host 'StreamPlatform is running:' -ForegroundColor Green
    if ($runBackend)  { Write-Host '  API  ->  http://localhost:8080' }
    if ($runFrontend) { Write-Host '  App  ->  http://localhost:3000' }
    Write-Host ''
    Write-Host 'Press Ctrl+C here to stop everything.' -ForegroundColor DarkGray

    while ($true) {
        Start-Sleep -Seconds 1
        if ($started | Where-Object { $_.HasExited }) {
            Write-Warn 'A service exited - shutting the rest down.'
            break
        }
    }
}
finally {
    foreach ($proc in $started) {
        if ($proc -and -not $proc.HasExited) {
            Write-Step "Stopping process $($proc.Id) ..."
            # taskkill /T so the child java/node processes go down with their launcher.
            & taskkill.exe /PID $proc.Id /T /F *> $null
        }
    }
}
