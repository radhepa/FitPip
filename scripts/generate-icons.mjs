import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { pipIcon } from './art/pip-icon.mjs'

await mkdir('public/icons', { recursive: true })
await writeFile('public/favicon.svg', pipIcon())
const render = (size, output, scale = 1) =>
  sharp(Buffer.from(pipIcon(scale))).resize(size, size).png({ compressionLevel: 9 }).toFile(output)
await render(192, 'public/icons/icon-192.png')
await render(512, 'public/icons/icon-512.png')
// The portrait fits Android's central 80%-diameter safe circle.
await render(512, 'public/icons/icon-maskable-512.png', .70)
await render(180, 'public/apple-touch-icon.png')
console.log('Pip launcher, maskable, Apple touch and favicon assets written to public/')
