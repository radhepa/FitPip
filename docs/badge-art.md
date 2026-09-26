# Badge art

The rank emblems in `public/badges/` are placeholders: a coloured coin, shield, gem or star with
the rank number. Replace them with real art whenever it's ready; no code changes are needed if
the file names stay the same.

## Files

| File | Rank | Colour |
| --- | --- | --- |
| `rank-01.svg` | 1 Wood | `#A24E3C` |
| `rank-02.svg` | 2 Bronze | `#C68520` |
| `rank-03.svg` | 3 Silver | `#6385D2` |
| `rank-04.svg` | 4 Gold | `#B88A08` |
| `rank-05.svg` | 5 Platinum | `#0A93A0` |
| `rank-06.svg` | 6 Emerald | `#5AA532` |
| `rank-07.svg` | 7 Diamond | `#2F95E8` |
| `rank-08.svg` | 8 Master | `#8452E0` |
| `rank-09.svg` | 9 Elite | `#C2307E` |
| `rank-10.svg` | 10 Legend | `#E4561A` |
| `rank-locked.svg` | not earned yet | grey |

## What new art should look like

- Square, with a transparent background and the emblem filling most of the square.
- 512 x 512 PNG (or SVG). Keep each file small (under about 80 KB) because the app stores them
  for offline use.
- Keep each rank's colour from the table above so the emblem matches the body map, and make the
  ranks clearly climb (plainer at Wood, grander at Legend). A different silhouette per tier
  (1-3, 4-6, 7-9, 10) helps people who can't tell the colours apart.
- Emblems show as small as 40 px, so avoid fine detail and text.

## Swapping them in

1. Put the new files in `public/badges/`.
2. If the names or extensions differ (for example `rank-01.png`), update the paths in
   `src/config/badgeArt.ts`.
3. For art for one badge in particular (a running badge, say), add it to `BADGE_ART` in the same
   file, for example `'activity:running': '/badges/running.png'`. The keys are listed there.
