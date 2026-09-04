[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$taskName = -join ((0x53E4, 0x6587, 0x5B57, 0x5B66, 0x672F, 0x5BFC, 0x822A, 0x002D, 0x6BCF, 0x5468, 0x5B66, 0x672F, 0x52A8, 0x6001, 0x68C0, 0x67E5) | ForEach-Object { [char]$_ })
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($null -eq $task) {
    Write-Host "Task not found; nothing was removed: $taskName"
    exit 0
}

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
Write-Host "Task removed: $taskName"
Write-Host 'Candidate files, logs, and website data were not deleted.'
