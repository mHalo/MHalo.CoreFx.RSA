#!/usr/bin/env node

/**
 * 从环境变量 GITHUB_REF_NAME 读取 tag（如 v1.2.3），同步版本号到各配置文件中。
 * 用法：node scripts/sync-version.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const tag = process.env.GITHUB_REF_NAME
if (!tag) {
  console.error('GITHUB_REF_NAME not set — skipping version sync')
  process.exit(0)
}

// 从 tag 中提取纯净版本号（去掉前缀 "v"）
const version = tag.replace(/^v/, '')
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Tag "${tag}" does not look like a version — skipping version sync`)
  process.exit(0)
}

console.log(`Syncing version to ${version} (from tag ${tag})`)

// ---- package.json ----
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.version = version
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log('  ✔ package.json')

// ---- tauri.conf.json ----
const tauriConfPath = resolve(root, 'src-tauri', 'tauri.conf.json')
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'))
tauriConf.version = version
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n')
console.log('  ✔ src-tauri/tauri.conf.json')

// ---- Cargo.toml ----
const cargoPath = resolve(root, 'src-tauri', 'Cargo.toml')
let cargoToml = readFileSync(cargoPath, 'utf8')
cargoToml = cargoToml.replace(/^version\s*=\s*".*"/m, `version = "${version}"`)
writeFileSync(cargoPath, cargoToml)
console.log('  ✔ src-tauri/Cargo.toml')

console.log('Version sync complete.')
