// Shared enamel crests, with colours supplied by the app's rank configuration.
const mix = (hex, target, amount) => '#' + [1, 3, 5].map((i) =>
  Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount) + target * amount).toString(16).padStart(2, '0'),
).join('')

const shapes = [
  'M64 17C91 17 109 36 109 62S89 106 64 113C39 106 19 88 19 62S37 17 64 17Z',
  'M64 14C91 14 110 33 110 60S90 99 64 109C38 99 18 87 18 60S37 14 64 14Z',
  'M64 10 105 31 111 72 91 98 64 114 37 98 17 72 23 31Z',
]
const shield = 'M64 22 103 35 99 75c-3 18-19 31-35 39-16-8-32-21-35-39l-4-40Z'

function surround(rank, dark, bright) {
  const outline = `stroke="${dark}" stroke-width="3.5" stroke-linejoin="round"`
  const pair = (left) => `${left}<g transform="translate(128 0) scale(-1 1)">${left}</g>`
  if (rank === 2) return `<path d="m31 84-5 31 20-8 13 11 5-31 5 31 13-11 20 8-5-31Z" fill="${dark}"/>
    <path d="m33 91-3 18 15-7 10 8 3-18m12 0 3 18 10-8 15 7-3-18" fill="${bright}"/>`
  if (rank === 3) return pair(`<path d="m23 42-13 12 5 27 20 11 3-21Z" fill="url(#metal)" ${outline}/>`)
  if (rank === 4) return `<path d="m32 36-5-24 21 9L64 5l16 16 21-9-5 24Z" fill="url(#metal)" ${outline}/>`
  if (rank === 5) return pair(`<path d="M36 44 8 27l6 29 12 9-10 1 8 22 17 9Z" fill="url(#metal)" ${outline}/><path d="m17 43 14 12m-5 18 9 7" stroke="${bright}" stroke-width="4" stroke-linecap="round"/>`)
  if (rank === 6) return pair(`<path d="M39 101C14 94 7 74 13 53c2 12 12 12 13 24-6-24-18-31-7-48 2 16 18 15 20 35Z" fill="url(#metal)" ${outline}/><path d="M20 46q-1 28 15 45" fill="none" stroke="${bright}" stroke-width="3" stroke-linecap="round"/>`)
  if (rank === 7) return pair(`<path d="m39 41-17-26-14 34 14 36 17 11Z" fill="url(#metal)" ${outline}/><path d="m22 15 1 41 15 15-16 14L8 49Z" fill="${bright}" opacity=".55"/>`)
  if (rank === 8) return pair(`<path d="M40 46 9 25l3 27 10 9-10 1 7 18 20 15Z" fill="url(#metal)" ${outline}/><path d="m19 44 14 12m-10 15 11 9" stroke="${bright}" stroke-width="4" stroke-linecap="round"/>`)
  if (rank === 9) return pair(`<path d="M42 47 7 14l3 30 9 11-9-1 8 22 10 6-7 4 20 18Z" fill="url(#metal)" ${outline}/><path d="m16 34 19 23m-12 9 13 12" stroke="${bright}" stroke-width="4" stroke-linecap="round"/>`)
  if (rank === 10) return pair(`<path d="M42 41C26 36 24 17 14 9c4 21-10 28-7 45l7-7c-1 20 7 31 24 39l-9-27 13 7Z" fill="url(#metal)" ${outline}/><path d="M16 29q-4 19 8 34l7 9" fill="none" stroke="#FFDB80" stroke-width="4" stroke-linecap="round"/>`)
  return ''
}

function crest(rank, dark, bright) {
  if (rank < 4) return ''
  const stroke = `stroke="${dark}" stroke-width="3.5" stroke-linejoin="round"`
  if (rank === 4) return `<path d="m64 12 7 10-7 10-7-10Z" fill="${bright}"/>`
  if (rank === 5) return `<path d="m64 7 11 13-11 13-11-13Z" fill="${bright}" ${stroke}/>`
  if (rank === 6) return `<path d="m64 5 14 15-14 16-14-16Z" fill="url(#metal)" ${stroke}/><path d="m64 10 7 10-7 8Z" fill="${bright}"/>`
  if (rank === 7) return `<path d="m53 8 22 0 10 12-21 20-21-20Z" fill="${bright}" ${stroke}/><path d="m43 20 42 0m-32-12 11 32L75 8" fill="none" stroke="${dark}" stroke-width="2.5"/>`
  if (rank === 8) return `<path d="m42 32-5-22 17 8L64 4l10 14 17-8-5 22Z" fill="url(#metal)" ${stroke}/><path d="m64 12 6 9-6 8-6-8Z" fill="${bright}"/>`
  if (rank === 9) return `<path d="m64 3 10 14 17-7-4 24H41l-4-24 17 7Z" fill="url(#metal)" ${stroke}/><path d="m64 11 9 12-9 12-9-12Z" fill="${bright}"/>`
  return `<path d="m39 33-8-21 20 8L64 3l13 17 20-8-8 21Z" fill="#FFDB80" ${stroke}/><path d="m64 9 9 13-9 12-9-12Z" fill="#FFF5CC"/>`
}

// Ears, headband, cream eye patches and muzzle form a recognizable Pip stamp.
function pipStamp(dark, bright) {
  return `<path d="M43 55 39 39q13-1 18 12 7-3 14 0 5-13 18-12l-4 16q8 8 7 19l5 7-8 1c-5 14-15 21-25 21S44 96 39 82l-8-1 5-7q-1-11 7-19Z" fill="${dark}"/>
    <path d="m45 45 7 8-7 1Zm38 0-7 8 7 1Z" fill="${bright}"/>
    <path d="M42 60q22-9 44 0v5q-22-7-44 0Z" fill="${bright}"/>
    <path d="M42 75c0-11 10-15 16-6l2 10c-9 6-16 3-18-4Zm44 0c0-11-10-15-16-6l-2 10c9 6 16 3 18-4ZM46 86q7-8 18-2 11-6 18 2c-7 15-29 15-36 0Z" fill="${bright}"/>
    <ellipse cx="51" cy="73" rx="3" ry="4" fill="${dark}"/><ellipse cx="77" cy="73" rx="3" ry="4" fill="${dark}"/>
    <path d="M60 84q4-2 8 0l-4 5Z" fill="${dark}"/>`
}

export function rankEmblem({ rank, name, color }) {
  const dark = mix(color, 0, .57)
  const bright = mix(color, 255, .77)
  const medium = mix(color, 255, .34)
  const body = rank <= 3 ? shapes[rank - 1] : shield
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${name} rank emblem">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${bright}"/><stop offset=".45" stop-color="${medium}"/><stop offset=".46" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="enamel" x2="0" y2="1"><stop stop-color="${medium}"/><stop offset="1" stop-color="${color}"/></linearGradient>
  </defs>
  ${surround(rank, dark, bright)}
  <path d="${body}" fill="${dark}" transform="translate(0 4)"/>
  <path d="${body}" fill="url(#metal)" stroke="${dark}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="${body}" transform="translate(64 64) scale(.81) translate(-64 -64)" fill="url(#enamel)" stroke="${bright}" stroke-width="2.5"/>
  ${rank === 1 ? `<path d="M29 48q6-10 12-13m-10 48 6 10m47-57 9 9m-4 45-8 9" fill="none" stroke="${dark}" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>` : ''}
  <g transform="translate(0 -8)">${pipStamp(dark, bright)}</g>
  ${rank >= 4 ? `<path d="m56 98 8 7 8-7" fill="none" stroke="${bright}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
  ${crest(rank, dark, bright)}
</svg>\n`
}

export function lockedEmblem() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Not earned yet">
  <path d="m64 17 43 16-4 43c-3 19-21 32-39 40-18-8-36-21-39-40l-4-43Z" fill="#687A91" stroke="#34465E" stroke-width="4" stroke-linejoin="round"/>
  <path d="m64 28 32 12-3 34c-2 14-16 25-29 32-13-7-27-18-29-32l-3-34Z" fill="#43566F" stroke="#A6B7CC" stroke-width="2"/>
  <path d="M51 60V50a13 13 0 0 1 26 0v10" fill="none" stroke="#D3DDE9" stroke-width="7" stroke-linecap="round"/>
  <rect x="43" y="58" width="42" height="32" rx="9" fill="#D3DDE9"/>
  <path d="M64 71v7" stroke="#43566F" stroke-width="6" stroke-linecap="round"/>
</svg>\n`
}
