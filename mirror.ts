#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageJson {
  name: string;
  version: string;
  dependencies: {
    pnpm: string;
  };
  packageManager?: string;
}

interface NpmRegistryResponse {
  versions: Record<string, unknown>;
}

async function main(): Promise<void> {
  const packageJson: PackageJson = JSON.parse(
    readFileSync(join(__dirname, 'package.json'), 'utf-8')
  );

  const allVersions = await getAllVersions();
  const currentVersion = getCurrentVersion(packageJson);
  const targetVersions = allVersions.filter(v => compareVersions(v, currentVersion) > 0);

  for (const version of targetVersions) {
    const paths = processVersion(version);

    const status = execSync('git status -s', { encoding: 'utf-8' }).trim();

    if (status) {
      execSync(`git add ${paths.join(' ')}`, { stdio: 'inherit' });
      execSync(`git commit -m "Mirror: ${version}"`, { stdio: 'inherit' });
      execSync(`git tag v${version}`, { stdio: 'inherit' });
    } else {
      console.log(`No change ${version}`);
    }
  }
}

async function getAllVersions(): Promise<string[]> {
  const response = await fetch('https://registry.npmjs.org/pnpm');
  if (!response.ok) {
    throw new Error('Failed to fetch versions from npm registry');
  }

  const data: NpmRegistryResponse = await response.json();
  const versions = Object.keys(data.versions)
    .filter(v => !v.includes('-'))
    .sort(compareVersions);

  return versions;
}

function getCurrentVersion(packageJson: PackageJson): string {
  return packageJson.dependencies.pnpm;
}

function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  return 0;
}

function processVersion(version: string): string[] {
  const packageJsonPath = join(__dirname, 'package.json');
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.dependencies.pnpm = version;
  packageJson.packageManager = `pnpm@${version}`;
  writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );

  const readmePath = join(__dirname, 'README.md');
  let readme = readFileSync(readmePath, 'utf-8');
  readme = readme.replace(/rev: v\d+\.\d+\.\d+/g, `rev: v${version}`);
  writeFileSync(readmePath, readme);

  return ['package.json', 'README.md'];
}

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
