$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$node = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if (-not (Test-Path $node)) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCommand) {
        throw "Node.js introuvable. Installez Node.js ou adaptez `$node dans ce script."
    }
    $node = $nodeCommand.Source
}

function Start-ServiceApp {
    param(
        [string] $Name,
        [string] $Path
    )

    Write-Host "Starting $Name..."
    Start-Process `
        -WindowStyle Hidden `
        -FilePath "cmd.exe" `
        -ArgumentList "/c", "mvnw.cmd spring-boot:run `"-Dspring-boot.run.profiles=local`"" `
        -WorkingDirectory $Path
}

Start-ServiceApp "discovery-service" "$root\discovery-service"
Start-ServiceApp "gateway-service" "$root\gateway-service"
Start-ServiceApp "customer-service" "$root\customer-service"
Start-ServiceApp "authentication-service" "$root\authentication-service"
Start-ServiceApp "account-service" "$root\account-service"
Start-ServiceApp "notification-service" "$root\notification-service"

Write-Host "Starting Angular frontend..."
Start-Process `
    -WindowStyle Hidden `
    -FilePath $node `
    -ArgumentList "node_modules\@angular\cli\bin\ng.js", "serve", "--proxy-config", "proxy.conf.json", "--host", "localhost", "--port", "4200" `
    -WorkingDirectory "$root\front"

Write-Host ""
Write-Host "Local dev stack is starting:"
Write-Host "- Frontend: http://localhost:4200"
Write-Host "- Discovery: http://localhost:8761"
Write-Host "- Gateway: http://localhost:8888"
Write-Host "- Customer: http://localhost:8886/bank"
Write-Host "- Auth:     http://localhost:8885/bank"
Write-Host "- Account:  http://localhost:8887/bank"
Write-Host "- Notification: http://localhost:8889/bank"
