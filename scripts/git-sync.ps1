<#
.SYNOPSIS
    Cyber Companion Git Branching & Feature Synchronization Manager
.DESCRIPTION
    Enforces the 3-tier branching model:
      main (production) -> develop (integration) -> feature/* (module branches)
    When a feature branch is updated, merges it into `develop` and automatically
    pulls/merges the updated `develop` branch back into all active `feature/*` branches.
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
        Write-Host "[Git-Sync] Creating new feature branch '$branchName' from 'develop'..." -ForegroundColor Cyan
        git checkout develop
        git pull origin develop
        git checkout -b $branchName
        git push -u origin $branchName
        Write-Host "[Git-Sync] Branch '$branchName' created and pushed to origin." -ForegroundColor Green
    }

    "sync" {
        if (-not $Feature) {
            $Feature = (git rev-parse --abbrev-ref HEAD).Trim()
        }
        $sourceBranch = if ($Feature.StartsWith("feature/")) { $Feature } else { "feature/$Feature" }

        Write-Host "[Git-Sync] 1/3 Pushing updates on '$sourceBranch'..." -ForegroundColor Cyan
        git checkout $sourceBranch
        git push origin $sourceBranch

        Write-Host "[Git-Sync] 2/3 Merging '$sourceBranch' into 'develop'..." -ForegroundColor Cyan
        git checkout develop
        git merge --no-ff $sourceBranch -m "chore(merge): integrate $sourceBranch into develop"
        git push origin develop

        Write-Host "[Git-Sync] 3/3 Pulling updated 'develop' back into all feature/* branches..." -ForegroundColor Cyan
        $featureBranches = git for-each-ref --format='%(refname:short)' refs/heads/feature/
        foreach ($fb in $featureBranches) {
            $fbTrimmed = $fb.Trim()
            if ($fbTrimmed -and ($fbTrimmed -ne $sourceBranch)) {
                Write-Host "  -> Syncing 'develop' into '$fbTrimmed'..." -ForegroundColor Yellow
                git checkout $fbTrimmed
                git merge develop -m "chore(sync): pull latest develop into $fbTrimmed"
                git push origin $fbTrimmed
            }
        }

        git checkout develop
        Write-Host "[Git-Sync] All feature branches are now synchronized with 'develop'!" -ForegroundColor Green
    }

    "release" {
        Write-Host "[Git-Sync] Promoting 'develop' to 'main'..." -ForegroundColor Cyan
        git checkout main
        git merge --no-ff develop -m "release: promote verified develop build to main"
        git push origin main
        git checkout develop
        Write-Host "[Git-Sync] Production branch 'main' updated successfully." -ForegroundColor Green
    }
}
