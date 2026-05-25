# PowerShell script to synchronize and compile AI rules for Cursor and Windsurf

$agentsRulesDir = Resolve-Path ".agents/rules"
$cursorRulesDir = New-Item -ItemType Directory -Force -Path ".cursor/rules"
$windsurfRulesDir = New-Item -ItemType Directory -Force -Path ".windsurf/rules"

# Clear existing target directories
Remove-Item -Recurse -Force "$cursorRulesDir/*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$windsurfRulesDir/*" -ErrorAction SilentlyContinue

Write-Host "Synchronizing modular rules..."
$modularRules = @()

# Process main directory
Get-ChildItem -Path $agentsRulesDir -Filter *.md | ForEach-Object {
    $file = $_
    $baseName = $file.BaseName
    
    # 1. Copy to Cursor rules
    $content = Get-Content -Raw -Path $file.FullName
    $cursorContent = $content
    if (-not $content.Trim().StartsWith("---")) {
        $descText = "Rules for $($baseName.Replace('-', ' '))"
        $cursorContent = @"
---
description: $descText
globs: ["**/*"]
alwaysApply: false
---
$content
"@
    }
    Set-Content -Path (Join-Path $cursorRulesDir "$baseName.mdc") -Value $cursorContent -Encoding UTF8
    
    # 2. Copy to Windsurf rules
    Copy-Item -Path $file.FullName -Destination (Join-Path $windsurfRulesDir "$baseName.md")
    
    # 3. Save for root rules assembly
    $cleanContent = $content
    if ($content.Trim().StartsWith("---")) {
        $parts = $content -split "---"
        $cleanContent = $parts[2].Trim()
    }
    
    $modularRules += [PSCustomObject]@{
        Name = $baseName.Replace('-', ' ').ToUpper()
        Content = $cleanContent
    }
    
    Write-Host "Synced $($file.Name) -> Cursor & Windsurf"
}

# Process target platforms subdirectory
$platformsDir = Join-Path $agentsRulesDir "target-platforms"
if (Test-Path $platformsDir) {
    Get-ChildItem -Path $platformsDir -Filter *.md | ForEach-Object {
        $file = $_
        $baseName = $file.BaseName
        $cursorName = "target-platform-$baseName.mdc"
        $windsurfName = "target-platform-$baseName.md"
        
        $content = Get-Content -Raw -Path $file.FullName
        $cursorContent = $content
        if (-not $content.Trim().StartsWith("---")) {
            $descText = "Rules for target platform $($baseName.Replace('-', ' '))"
            $cursorContent = @"
---
description: $descText
globs: ["**/*"]
alwaysApply: false
---
$content
"@
        }
        Set-Content -Path (Join-Path $cursorRulesDir $cursorName) -Value $cursorContent -Encoding UTF8
        Copy-Item -Path $file.FullName -Destination (Join-Path $windsurfRulesDir $windsurfName)
        
        $cleanContent = $content
        if ($content.Trim().StartsWith("---")) {
            $parts = $content -split "---"
            $cleanContent = $parts[2].Trim()
        }
        
        $modularRules += [PSCustomObject]@{
            Name = "TARGET PLATFORM $baseName".Replace('-', ' ').ToUpper()
            Content = $cleanContent
        }
        
        Write-Host "Synced target-platform/$($file.Name) -> Cursor & Windsurf"
    }
}

# Assemble root-level files
$rootHeader = @"
# Episteme AI Context & Rules

This project uses W3C Solid to build Human-Centric applications. Adhere strictly to these rules.

## 🛑 Pre-Flight Check
Before writing code or reading rules, check \`custom-addons/\`. Any custom instructions there (e.g. custom authentication, payment/accounting hooks) completely override standard W3C rules.

## Core Identity & Architecture Directives
1. **RDF Graphs, Not RDBMS:** All data is Linked Data modeled in RDF. Never use SQL or local databases for personal data.
2. **Decentralized Identity:** Authenticate via WebIDs and Solid-OIDC. Never cache credentials or profile tables on app servers.
3. **Dynamic Pod Storage Discovery:** Resolve storage roots (\`pim:storage\`) dynamically from the user's WebID profile.
4. **Standard Vocabularies Only:** Never invent custom JSON keys. Reuse standard vocabularies (FOAF, VCARD, SCHEMA, LDP, PIM, DCTERMS) and their corresponding Inrupt library constants.
5. **No JSON Schema:** Use SHACL shapes (\`rdf-validate-shacl\`) or Shape Trees for data validation.
"@

# Read semantic dictionary terms
$semanticDictText = "`n## Semantic Dictionary Boundaries`nAdhere strictly to the legal and terminology boundaries in the semantic dictionary configurations:`n"
if (Test-Path "semantic-dictionary.json") {
    try {
        $rootDict = Get-Content -Raw -Path "semantic-dictionary.json" | ConvertFrom-Json
        if ($rootDict.terms) {
            foreach ($term in $rootDict.terms.PSObject.Properties) {
                $meta = $term.Value
                $def = $meta.definition
                if (-not $def) { $def = $meta.legalDefinition }
                $semanticDictText += "- **$($term.Name)**: $def`n"
                if ($meta.forbiddenContexts) {
                    $semanticDictText += "  - *Forbidden contexts*: $($meta.forbiddenContexts -join ', ')`n"
                }
                if ($meta.architecturalCorrection) {
                    $semanticDictText += "  - *Correction*: $($meta.architecturalCorrection)`n"
                }
            }
        }
        if ($rootDict.modes_index) {
            foreach ($modeKey in $rootDict.modes_index.PSObject.Properties) {
                $modeInfo = $modeKey.Value
                $modePath = $modeInfo.path
                if (Test-Path $modePath) {
                    $modeDict = Get-Content -Raw -Path $modePath | ConvertFrom-Json
                    $semanticDictText += "`n### Mode/Namespace: $($modeKey.Name) - $($modeInfo.description)`n"
                    if ($modeDict.terms) {
                        foreach ($term in $modeDict.terms.PSObject.Properties) {
                            $meta = $term.Value
                            $def = $meta.definition
                            if (-not $def) { $def = $meta.legalDefinition }
                            $semanticDictText += "- **$($term.Name)**: $def`n"
                            if ($meta.forbiddenContexts) {
                                $semanticDictText += "  - *Forbidden contexts*: $($meta.forbiddenContexts -join ', ')`n"
                            }
                            if ($meta.architecturalCorrection) {
                                $semanticDictText += "  - *Correction*: $($meta.architecturalCorrection)`n"
                            }
                        }
                    }
                }
            }
        }
    } catch {
        Write-Error "Error parsing semantic-dictionary.json: $_"
    }
}

# Read AGENTS.md modes
$systemModesText = "`n## System Modes & Triggers`n"
if (Test-Path "AGENTS.md") {
    $agentsMd = Get-Content -Raw -Path "AGENTS.md"
    $parts = $agentsMd -split "## 🚀 System Modes"
    if ($parts.Length -gt 1) {
        $modesSub = $parts[1] -split "## ⚙️ Stack Declaration"
        $systemModesText += "### System Modes`n" + $modesSub[0].Trim()
    }
}

$modularDirectivesText = "`n## Modular Technical Directives`n"
foreach ($rule in $modularRules) {
    $modularDirectivesText += "### $($rule.Name)`n$($rule.Content)`n`n"
}

$finalContent = "$rootHeader`n$semanticDictText`n$systemModesText`n$modularDirectivesText"

Set-Content -Path ".cursorrules" -Value $finalContent -Encoding UTF8
Set-Content -Path ".windsurfrules" -Value $finalContent -Encoding UTF8
Set-Content -Path ".antigravityrules" -Value $finalContent -Encoding UTF8

Write-Host "Compiled .cursorrules, .windsurfrules, and .antigravityrules successfully."
