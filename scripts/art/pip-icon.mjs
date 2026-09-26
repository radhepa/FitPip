// Pip's launcher portrait: the current blue coat, cream markings, cheek tufts,
// dark ears and diamond headband, simplified for a small home-screen tile.
export function pipIcon(scale = 1) {
  const offset = 256 * (1 - scale)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="FitPip, Pip the blue panda">
  <defs>
    <linearGradient id="bg" x2="0" y2="1"><stop stop-color="#458EF4"/><stop offset="1" stop-color="#2561CB"/></linearGradient>
    <linearGradient id="coat" x2=".3" y2="1"><stop stop-color="#8DCEFF"/><stop offset="1" stop-color="#4F9AE9"/></linearGradient>
    <linearGradient id="cream" x2="0" y2="1"><stop stop-color="#F4FBFF"/><stop offset="1" stop-color="#D2EBFF"/></linearGradient>
  </defs>
  <path fill="url(#bg)" d="M0 0h512v512H0z"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="M105 181C66 158 47 94 64 47c53-1 94 33 110 79Zm302 0c39-23 58-87 41-134-53-1-94 33-110 79Z" fill="#193C69"/>
    <path d="M106 139C88 118 80 89 85 73c30 5 53 25 64 49Zm300 0c18-21 26-50 21-66-30 5-53 25-64 49Z" fill="#D7EFFF"/>
    <path d="m413 184 64 17-21 24-48-14 46 43-29 8-37-48Z" fill="#B9EFFF"/>
    <path d="M78 235C78 135 146 82 256 82s178 53 178 153l22 39-24 3 18 30-32-1c-20 89-84 142-162 142S114 395 94 306l-32 1 18-30-24-3Z" fill="#235A9C" transform="translate(0 12)"/>
    <path d="M78 235C78 135 146 82 256 82s178 53 178 153l22 39-24 3 18 30-32-1c-20 89-84 142-162 142S114 395 94 306l-32 1 18-30-24-3Z" fill="url(#coat)"/>
    <path d="M170 119q40-19 76-15" fill="none" stroke="#B9E5FF" stroke-width="12" stroke-linecap="round"/>
    <path d="M84 178q171-64 344 0l6 44q-179-59-356 0Z" fill="#B9EFFF"/>
    <path d="M88 181q168-60 336 0" fill="none" stroke="#ECFCFF" stroke-width="7"/>
    <path d="m256 158 19 22-19 22-19-22Z" fill="#4F96D2"/>
    <path d="M112 274c0-43 27-68 61-61 39 7 57 48 40 88-44 23-87 12-101-27Zm288 0c0-43-27-68-61-61-39 7-57 48-40 88 44 23 87 12 101-27Z" fill="url(#cream)"/>
    <path d="m139 310 66-5-17 58Zm234 0-66-5 17 58Z" fill="#3476B9"/>
    <path d="M128 366c18-42 74-51 128-19 54-32 110-23 128 19-24 43-72 64-128 64s-104-21-128-64Z" fill="url(#cream)"/>
    <ellipse cx="172" cy="269" rx="25" ry="34" fill="#142C4C"/>
    <ellipse cx="340" cy="269" rx="25" ry="34" fill="#142C4C"/>
    <ellipse cx="176" cy="281" rx="14" ry="15" fill="#2D527C"/>
    <ellipse cx="344" cy="281" rx="14" ry="15" fill="#2D527C"/>
    <circle cx="164" cy="257" r="9" fill="#FFF"/><circle cx="332" cy="257" r="9" fill="#FFF"/>
    <ellipse cx="116" cy="327" rx="23" ry="12" fill="#EAA7D3"/><ellipse cx="396" cy="327" rx="23" ry="12" fill="#EAA7D3"/>
    <path d="M236 352q20-12 40 0c-1 14-13 22-20 22s-19-8-20-22Z" fill="#142C4C"/>
    <path d="m245 351 10-2" stroke="#7195B9" stroke-width="4" stroke-linecap="round"/>
    <path d="M228 388q28 17 56 0c-3 40-53 40-56 0Z" fill="#142C4C"/>
    <path d="M238 411q18-17 36 0c-10 10-26 10-36 0Z" fill="#F0A7C4"/>
  </g>
</svg>`
}
