$ErrorActionPreference = "Continue"

$checks = @(
    @{ Name = "Customer"; Url = "http://localhost:8886/bank/actuator/health" },
    @{ Name = "Authentication"; Url = "http://localhost:8885/bank/actuator/health" },
    @{ Name = "Account"; Url = "http://localhost:8887/bank/actuator/health" },
    @{ Name = "Notification"; Url = "http://localhost:8889/bank/actuator/health" },
    @{ Name = "Discovery"; Url = "http://localhost:8761/actuator/health" },
    @{ Name = "Gateway"; Url = "http://localhost:8888/actuator/health" },
    @{ Name = "Customers API"; Url = "http://localhost:8886/bank/customers/list" },
    @{ Name = "Auth local API"; Url = "http://localhost:8885/bank/local/users" },
    @{ Name = "Account local API"; Url = "http://localhost:8887/bank/local/accounts" },
    @{ Name = "Notification API"; Url = "http://localhost:8889/bank/actuator/health" }
)

foreach ($check in $checks) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing $check.Url -TimeoutSec 5
        Write-Host ("{0,-20} OK   {1}" -f $check.Name, $response.StatusCode)
    } catch {
        Write-Host ("{0,-20} DOWN {1}" -f $check.Name, $_.Exception.Message)
    }
}
