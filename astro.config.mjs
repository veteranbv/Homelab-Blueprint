import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

const targets = {
  local: { site: 'http://localhost:4321', base: '/' },
  cloudflare: { site: 'https://homelab.codes', base: '/guide' },
  github: { site: 'https://veteranbv.github.io', base: '/Homelab-Blueprint' },
}

const targetName = process.env.DEPLOY_TARGET ?? 'local'
if (!(targetName in targets)) {
  throw new Error(`DEPLOY_TARGET must be one of: ${Object.keys(targets).join(', ')}`)
}

const target = targets[targetName]

export default defineConfig({
  srcDir: './site/src',
  publicDir: './site/public',
  outDir: './dist',
  site: target.site,
  base: target.base,
  trailingSlash: 'always',
  integrations: [react(), ...(targetName === 'cloudflare' ? [sitemap()] : [])],
})
