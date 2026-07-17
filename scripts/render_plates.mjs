#!/usr/bin/env node
// Renderer for the five plates.
// Loads the same React source used by the site, produces deterministic standalone
// SVG files, then rasterizes to PNG through the already-installed Playwright
// Chromium. Writes docs/images/render-manifest.json with SHA-256s.

import { createServer } from 'vite'
import { chromium } from '@playwright/test'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE_ROOT = path.join(ROOT, 'site')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'images')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'render-manifest.json')

const RENDER_WIDTH = 1600
const RENDER_HEIGHT = 1000

const args = process.argv.slice(2)
const CHECK = args.includes('--check')

function sha256(input) {
  const hash = crypto.createHash('sha256')
  hash.update(input)
  return hash.digest('hex')
}

function filenameFor(id, _theme, extension) {
  return `${id}.${extension}`
}

async function readIfExists(filepath) {
  try {
    return await fs.readFile(filepath)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function wrapSvg(rawSvg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${rawSvg}\n`
}

function rasterizeHtml(svgWithHeader) {
  const inner = svgWithHeader.replace(/^<\?xml[^?]*\?>\s*/, '')
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;} svg{display:block;width:${RENDER_WIDTH}px;height:${RENDER_HEIGHT}px;}</style></head><body>${inner}</body></html>`
}

async function loadRenderer() {
  const server = await createServer({
    root: SITE_ROOT,
    logLevel: 'silent',
    configFile: false,
    server: { middlewareMode: true },
    appType: 'custom',
    plugins: [(await import('@vitejs/plugin-react')).default()],
  })
  try {
    const entry = await server.ssrLoadModule('/src/plates/render-entry.ts')
    if (typeof entry.renderAll !== 'function') {
      throw new Error('render-entry.ts does not export renderAll()')
    }
    return { server, entry }
  } catch (error) {
    await server.close()
    throw error
  }
}

async function renderArtifacts() {
  const { server, entry } = await loadRenderer()
  try {
    const rendered = entry.renderAll()
    return rendered.map((item) => ({
      id: item.id,
      theme: item.theme,
      svg: wrapSvg(item.svg),
    }))
  } finally {
    await server.close()
  }
}

async function rasterize(artifacts) {
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({
      viewport: { width: RENDER_WIDTH, height: RENDER_HEIGHT },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const buffers = new Map()
    for (const artifact of artifacts) {
      const key = `${artifact.id}:${artifact.theme}`
      await page.setContent(rasterizeHtml(artifact.svg), { waitUntil: 'load' })
      await page.evaluate(() => {
        return document.fonts.ready.catch(() => null)
      })
      const buffer = await page.screenshot({
        type: 'png',
        omitBackground: false,
        clip: { x: 0, y: 0, width: RENDER_WIDTH, height: RENDER_HEIGHT },
      })
      buffers.set(key, buffer)
    }
    await context.close()
    return buffers
  } finally {
    await browser.close()
  }
}

async function writeArtifacts(artifacts, pngBuffers) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const manifest = {}
  const writtenSvgs = []
  const writtenPngs = []
  for (const artifact of artifacts) {
    const svgName = filenameFor(artifact.id, artifact.theme, 'svg')
    const pngName = filenameFor(artifact.id, artifact.theme, 'png')
    const svgPath = path.join(OUTPUT_DIR, svgName)
    const pngPath = path.join(OUTPUT_DIR, pngName)
    await fs.writeFile(svgPath, artifact.svg, 'utf-8')
    writtenSvgs.push(svgPath)
    console.log(path.relative(ROOT, svgPath))

    const buffer = pngBuffers?.get(`${artifact.id}:${artifact.theme}`)
    if (buffer) {
      await fs.writeFile(pngPath, buffer)
      writtenPngs.push(pngPath)
      console.log(path.relative(ROOT, pngPath))
    }

    manifest[path.relative(ROOT, svgPath)] = {
      svg_sha256: sha256(artifact.svg),
      png: path.relative(ROOT, pngPath),
      png_sha256: buffer ? sha256(buffer) : null,
    }
  }
  const sorted = Object.fromEntries(
    Object.keys(manifest)
      .sort()
      .map((key) => [key, manifest[key]]),
  )
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8')
  console.log(path.relative(ROOT, MANIFEST_PATH))
  return { manifest: sorted, writtenSvgs, writtenPngs }
}

async function checkArtifacts(artifacts) {
  const errors = []
  const expectedSvgs = new Set()
  const expectedPngs = new Set()
  const expectedManifest = {}
  for (const artifact of artifacts) {
    const svgName = filenameFor(artifact.id, artifact.theme, 'svg')
    const pngName = filenameFor(artifact.id, artifact.theme, 'png')
    const svgPath = path.join(OUTPUT_DIR, svgName)
    const pngPath = path.join(OUTPUT_DIR, pngName)
    expectedSvgs.add(svgPath)
    expectedPngs.add(pngPath)
    const existingSvg = await fs.readFile(svgPath, 'utf-8').catch(() => null)
    if (existingSvg === null) {
      errors.push(`${path.relative(ROOT, svgPath)} missing`)
    } else if (existingSvg !== artifact.svg) {
      errors.push(`${path.relative(ROOT, svgPath)} stale`)
    }
    const existingPng = await readIfExists(pngPath)
    if (!existingPng) {
      errors.push(`${path.relative(ROOT, pngPath)} missing`)
    }
    expectedManifest[path.relative(ROOT, svgPath)] = {
      svg_sha256: sha256(artifact.svg),
      png: path.relative(ROOT, pngPath),
      png_sha256: existingPng ? sha256(existingPng) : null,
    }
  }

  const manifestText = await fs.readFile(MANIFEST_PATH, 'utf-8').catch(() => null)
  if (manifestText === null) {
    errors.push(`${path.relative(ROOT, MANIFEST_PATH)} missing`)
  } else {
    let existingManifest
    try {
      existingManifest = JSON.parse(manifestText)
    } catch (parseError) {
      errors.push(`${path.relative(ROOT, MANIFEST_PATH)} unreadable: ${parseError.message}`)
      existingManifest = {}
    }
    for (const key of Object.keys(expectedManifest)) {
      const expected = expectedManifest[key]
      const existing = existingManifest[key]
      if (!existing) {
        errors.push(`${key}: missing manifest entry`)
        continue
      }
      if (existing.svg_sha256 !== expected.svg_sha256) {
        errors.push(`${key}: manifest SVG digest mismatch`)
      }
      if (existing.png_sha256 !== expected.png_sha256) {
        errors.push(`${key}: manifest PNG digest mismatch`)
      }
    }
    for (const key of Object.keys(existingManifest)) {
      if (!(key in expectedManifest)) {
        errors.push(`${key}: orphaned manifest entry`)
      }
    }
  }

  const actualSvgs = await fs.readdir(OUTPUT_DIR).catch(() => [])
  for (const name of actualSvgs) {
    if (!name.startsWith('plate-')) continue
    const full = path.join(OUTPUT_DIR, name)
    if (name.endsWith('.svg') && !expectedSvgs.has(full)) {
      errors.push(`${path.relative(ROOT, full)}: not produced by any plate model`)
    }
    if (name.endsWith('.png') && !expectedPngs.has(full)) {
      errors.push(`${path.relative(ROOT, full)}: not produced by any plate model`)
    }
  }

  return errors
}

async function main() {
  const artifacts = await renderArtifacts()

  if (CHECK) {
    const errors = await checkArtifacts(artifacts)
    if (errors.length > 0) {
      console.error('Plate artifacts are stale:')
      for (const error of errors) console.error(`  - ${error}`)
      process.exit(1)
    }
    console.log('Plates are up to date.')
    return
  }

  const pngBuffers = await rasterize(artifacts)
  await writeArtifacts(artifacts, pngBuffers)
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error)
  process.exit(1)
})
