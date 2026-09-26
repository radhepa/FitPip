import { mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { RANKS } from '../src/config/ranks.ts'

// Review the actual shipped assets at badge and small UI sizes in both themes.
const width = 1200
const height = 1110
const layers = []
const texts = []
const text = (x, y, value, size = 18, fill = '#EAF3FF', weight = 600) =>
  texts.push(`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${value}</text>`)
text(260, 85, 'FitPip', 50)
text(262, 126, 'Pip on your home screen. Progress worth collecting.', 22, '#A9BBD5', 400)
text(262, 169, 'TEN RANKS  /  ONE COMPANION', 15, '#83BCFF')
text(48, 258, 'NIGHT', 14, '#A9BBD5')
text(48, 678, 'LIGHT', 14, '#53657A')
await mkdir('docs', { recursive: true })
const app = await sharp('public/icons/icon-512.png').resize(176, 176).toBuffer()
layers.push({ input: app, left: 48, top: 32 })
const maskable = await sharp('public/icons/icon-maskable-512.png').resize(104, 104).composite([
  { input: Buffer.from('<svg width="104" height="104"><circle cx="52" cy="52" r="52" fill="white"/></svg>'), blend: 'dest-in' },
]).toBuffer()
layers.push({ input: maskable, left: 1020, top: 60 })
for (const [top, ink] of [[278, '#EAF3FF'], [698, '#24364E']]) {
  for (const r of RANKS) {
    const x = 74 + ((r.rank - 1) % 5) * 224
    const y = top + Math.floor((r.rank - 1) / 5) * 181
    const input = await readFile(`public/badges/rank-${String(r.rank).padStart(2, '0')}.svg`)
    layers.push({ input: await sharp(input).resize(110, 110).toBuffer(), left: x, top: y })
    layers.push({ input: await sharp(input).resize(32, 32).toBuffer(), left: x + 120, top: y + 66 })
    text(x + 8, y + 137, `${String(r.rank).padStart(2, '0')}  ${r.name}`, 18, ink)
  }
}
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<rect width="${width}" height="${height}" fill="#0B1424"/>
<rect x="24" y="230" width="1152" height="400" rx="24" fill="#131F33"/>
<rect x="24" y="650" width="1152" height="430" rx="24" fill="#F3F6FC"/>
<g font-family="Arial, sans-serif">${texts.join('')}</g></svg>`
await sharp(Buffer.from(bg)).composite(layers).png().toFile('docs/art-preview.png')
console.log('Review board written to docs/art-preview.png')
