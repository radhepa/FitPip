import { copyFile, mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'

// The selected Focused close-up, with its dark navy background, is the source
// for every launcher asset and the README preview. Regeneration is fully local.
const source = await readFile(new URL('./art/pip-focused-dark.png', import.meta.url))

await mkdir('public/icons', { recursive: true })
await mkdir('docs/images', { recursive: true })
const render = (size, output, inset = 0) => {
  let image = sharp(source).resize(size - inset * 2, size - inset * 2)
  if (inset) image = image.extend({ top: inset, bottom: inset, left: inset, right: inset, extendWith: 'copy' })
  return image.png({ compressionLevel: 9 }).toFile(output)
}
await render(192, 'public/icons/icon-192.png')
await render(512, 'public/icons/icon-512.png')
// A tiny inset protects the smile inside Android's safe area; repeated edge
// pixels keep the close-up full bleed without adding a visible frame.
await render(512, 'public/icons/icon-maskable-512.png', 4)
await render(180, 'public/apple-touch-icon.png')
await render(64, 'public/favicon.png')
await copyFile('public/icons/icon-192.png', 'docs/images/fitpip-mobile-icon.png')
console.log('Focused Pip launcher, maskable, Apple touch, favicon and README preview written')
