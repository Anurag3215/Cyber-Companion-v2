<#
.SYNOPSIS
    Cyber Companion Git Branching & Feature Synchronization Manager
#>

param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("new", "sync", "release")]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [string]$Feature = ""
)

$ErrorActionPreference = "Stop"
$env:GIT_SYNC_ACTIVE = "1"

switch ($Action) {
    "new" {
        if (-not $Feature) {
            Write-Error "Please specify -Feature (e.g., feature/my-feature)"
        }
        $branchName = if ($Feature.StartsWith("feature/")) { $Feature } else { "feature/$Feature" }
        git checkout develop
        git pull origin develop
        git checkout -b $branchName
        git push -u origin $branchName
    }

    "sync" {
        if (-not $Feature) {
            $Feature = (git rev-parse --abbrev-ref HEAD).Trim()
        }
        $sourceBranch = if ($Feature.StartsWith("feature/")) { $Feature } else { "feature/$Feature" }

        git checkout $sourceBranch
        git push origin $sourceBranch

        git checkout develop
        git merge $sourceBranch -m "sync $sourceBranch"
        git push origin develop

        $featureBranches = git for-each-ref --format='%(refname:short)' refs/heads/feature/
        foreach ($fb in $featureBranches) {
            $fbTrimmed = $fb.Trim()
            if ($fbTrimmed) {
                git checkout $fbTrimmed
                git merge develop -m "sync develop"
                git push origin $fbTrimmed
            }
        }

        git checkout develop
    }

    "release" {
        git checkout main
        git merge develop -m "release to main"
        git push origin main
        git checkout develop
    }
}
