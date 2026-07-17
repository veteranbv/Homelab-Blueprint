#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'docs', 'images')
const destination = path.join(root, 'site', 'public', 'images')

await fs.rm(destination, { recursive: true, force: true })
await fs.mkdir(path.dirname(destination), { recursive: true })
await fs.cp(source, destination, { recursive: true })
