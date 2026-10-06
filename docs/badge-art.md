# Pip icons and rank crests

The ten ranks share a Pip enamel crest: pointed ears, a headband, cream eye patches and a
muzzle. Each rank keeps the colour used by the strength map. Shape, material and ornament
also progress so colour is not the only way to distinguish them. There is no tiny lettering
or rank number baked into the art; the interface supplies accessible names and rank numbers.

![Pip icon and all ten crests in both themes](art-preview.png)

## Rank artwork

| File | Rank | Colour | Distinctive feature |
| --- | --- | --- | --- |
| `rank-01.svg` | Wood | `#A24E3C` | Carved wooden medallion |
| `rank-02.svg` | Bronze | `#C68520` | Metal medal with ribbon tails |
| `rank-03.svg` | Silver | `#6385D2` | Faceted hexagonal plate |
| `rank-04.svg` | Gold | `#B88A08` | Crowned shield |
| `rank-05.svg` | Platinum | `#0A93A0` | Winged shield and diamond crest |
| `rank-06.svg` | Emerald | `#5AA532` | Leaf surround and emerald crest |
| `rank-07.svg` | Diamond | `#2F95E8` | Cut gem and crystal wings |
| `rank-08.svg` | Master | `#8452E0` | Three-point crown and feathered wings |
| `rank-09.svg` | Elite | `#C2307E` | Tall, layered wings and jewel crown |
| `rank-10.svg` | Legend | `#E4561A` | Flame wings and a warm gold crown |
| `rank-locked.svg` | Not earned | Neutral slate | Lock on the same shield |

Assets live in `public/badges/`. Each has a transparent 128-unit square viewBox, scales to any
resolution, and is under 5 KB. They are checked at 32px (rank ladders), 36px (body-part ranks),
and larger badge sizes on both themes. The app uses the same assets in Profile, lift and
activity sheets, body-part ranks and workout rewards. The service worker precaches them.

Edit `scripts/art/rank-emblems.mjs`, then run `npm run badges` (Node 22.18+ for native TypeScript
imports). Rank names and colours are read directly from `src/config/ranks.ts`; do not maintain
a second rank palette. `src/config/badgeArt.ts` maps the files and still supports optional
`lift:`, `activity:`, `muscle:` and `overall` overrides.

## App icon

The app uses the selected **Focused** close-up (version 4): Pip's big eyes, confident
eyebrows, cream muzzle and diamond headband fill the tile. A dark navy background
contrasts with his blue fur. The source image is
`scripts/art/pip-focused-dark.png`; the original five concepts are in
`docs/icon-concepts/face-closeups/`.

Replace the source PNG to revise the icon, then run `npm run icons`. It writes:

- `public/favicon-<hash>.png` — 64px browser icon.
- `public/icons/icon-192-<hash>.png` and `icon-512-<hash>.png` — standard PWA icons.
- `public/icons/icon-maskable-512-<hash>.png` — close-up with a slight inset protecting the smile inside Android's safe area.
- `public/apple-touch-icon-<hash>.png` — 180px iOS home-screen icon.
- `docs/images/fitpip-mobile-icon.png` — the same 192px icon shown in the main README.
- `src/config/appIcons.ts` — generated paths used by the HTML, manifest and review board.

The icon canvas is opaque and square; the operating system supplies corner or circle masks.
Each hash comes from the final PNG bytes, so changing the artwork also changes its URL.
Unversioned PNG aliases remain available for older app shells and Safari's root fallback.
Keep the manifest at `/manifest.webmanifest` and the app identity at `/`; version the icons,
not the manifest or launch address. Existing installed home-screen icons may need a fresh
installation; see the phone setup instructions in the main README.

## Review and reproduce

Run `node scripts/preview-art.mjs` after regenerating assets to refresh `docs/art-preview.png`.
The board uses the actual shipped assets at 110px and 32px, plus a circular maskable icon.
The preview stays in docs and is not added to the app's offline cache.

Rank crests use editable SVG source, and the app icon uses the selected PNG artwork.
Regeneration runs locally with the repository's existing Sharp dependency.
