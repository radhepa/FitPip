import { mkdir, writeFile } from 'node:fs/promises'
import { RANKS } from '../src/config/ranks.ts'
import { rankEmblem, lockedEmblem } from './art/rank-emblems.mjs'

await mkdir('public/badges', { recursive: true })
for (const rank of RANKS) {
  const filename = `rank-${String(rank.rank).padStart(2, '0')}.svg`
  await writeFile(`public/badges/${filename}`, rankEmblem(rank).replace(/[ \t]+\n/g, '\n'))
}
await writeFile('public/badges/rank-locked.svg', lockedEmblem())
console.log('Ten Pip rank crests and the locked emblem written to public/badges/')
