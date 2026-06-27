#!/usr/bin/env node
import { readdir, mkdtemp, copyFile, cp, rm, access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const examplesDir = join(root, 'examples', 'csharp')
const templateDir = join(root, 'scripts', 'csharp-verify-template')
const localDotnetRoot = join(root, 'scripts', '.dotnet-local')
const localDotnet = join(localDotnetRoot, 'dotnet')

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function isBackupSdkFailure(output) {
  return output.includes('MSB4242') && output.includes("'backup'")
}

async function resolveDotnetRunner() {
  if (await pathExists(localDotnet)) {
    return {
      command: localDotnet,
      env: { ...process.env, DOTNET_ROOT: localDotnetRoot, DOTNET_CLI_TELEMETRY_OPTOUT: '1' },
    }
  }

  const probe = spawnSync('dotnet', ['--version'], { encoding: 'utf-8' })
  if (probe.status === 0) {
    return { command: 'dotnet', env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1' } }
  }

  if (isBackupSdkFailure(probe.stderr || probe.stdout || '')) {
    console.error(
      'System dotnet SDK is broken (sdk-manifests/backup). Install a local SDK with:\n' +
        '  curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 8.0 --install-dir scripts/.dotnet-local',
    )
  }

  return null
}

const runner = await resolveDotnetRunner()
if (!runner) {
  process.exit(1)
}

const files = (await readdir(examplesDir)).filter((f) => f.endsWith('.cs')).sort()
let failed = 0

for (const file of files) {
  const src = join(examplesDir, file)
  const tempDir = await mkdtemp(join(tmpdir(), 'dsa-csharp-'))
  try {
    await cp(templateDir, tempDir, { recursive: true })
    await copyFile(src, join(tempDir, 'Program.cs'))

    const build = spawnSync(
      runner.command,
      ['build', tempDir, '--nologo', '-v', 'q', '/p:UseAppHost=true'],
      { encoding: 'utf-8', env: runner.env },
    )
    if (build.status !== 0) {
      failed++
      console.error(`FAIL build ${file}:\n${build.stderr || build.stdout}`)
      continue
    }

    const dllPath = join(tempDir, 'bin', 'Debug', 'net8.0', 'VerifyExample.dll')
    const run = spawnSync(runner.command, ['exec', dllPath], { encoding: 'utf-8', env: runner.env })
    if (run.status !== 0) {
      failed++
      console.error(`FAIL run ${file}:\n${run.stderr || run.stdout}`)
      continue
    }

    console.log(`OK ${basename(file)}`)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

if (failed > 0) {
  console.error(`\n${failed} C# example(s) failed verification.`)
  process.exit(1)
}

console.log(`\nAll ${files.length} C# examples built and ran successfully.`)