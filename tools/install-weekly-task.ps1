[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$taskName = -join ((0x53E4, 0x6587, 0x5B57, 0x5B66, 0x672F, 0x5BFC, 0x822A, 0x002D, 0x6BCF, 0x5468, 0x5B66, 0x672F, 0x52A8, 0x6001, 0x68C0, 0x67E5) | ForEach-Object { [char]$_ })
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$batchPath = Join-Path $PSScriptRoot 'run-weekly-check.bat'

if (-not (Test-Path -LiteralPath $batchPath -PathType Leaf)) {
    throw "Weekly runner not found: $batchPath"
}

$powerShellPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$escapedBatchPath = $batchPath.Replace("'", "''")
$powerShellArguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "& ''{0}''"' -f $escapedBatchPath
$action = New-ScheduledTaskAction -Execute $powerShellPath -Argument $powerShellArguments -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At '10:00'
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 2)
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited

$task = New-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Weekly official-site candidate check. Does not publish results.'

Register-ScheduledTask -TaskName $taskName -InputObject $task -Force | Out-Null

Write-Host "Task created: $taskName"
Write-Host 'Schedule: Sunday at 10:00'
Write-Host "User: $currentUser"
Write-Host "Runner: $batchPath"
Write-Host 'Missed starts will run when Task Scheduler next considers the task available.'
Write-Host 'To test immediately, run: tools\run-weekly-check.bat'
