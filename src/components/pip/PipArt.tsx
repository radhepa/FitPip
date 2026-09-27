import type { CSSProperties } from 'react'
import type { PipPose, PipReaction } from './types'

export function PipDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-coat`} x1="0" y1="0" x2=".8" y2="1">
        <stop stopColor="#85C7FF" /><stop offset=".45" stopColor="#529EEE" /><stop offset="1" stopColor="#2E6CBD" />
      </linearGradient>
      <linearGradient id={`${id}-dark`} x1="0" y1="0" x2=".6" y2="1">
        <stop stopColor="#304E79" /><stop offset="1" stopColor="#142640" />
      </linearGradient>
      <linearGradient id={`${id}-cream`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#F1F9FF" /><stop offset="1" stopColor="#B9DBF4" />
      </linearGradient>
      <linearGradient id={`${id}-tail`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#78B9F4" /><stop offset="1" stopColor="#3479CD" />
      </linearGradient>
      <radialGradient id={`${id}-aura`}>
        <stop stopColor="#75BCFF" stopOpacity=".23" /><stop offset="1" stopColor="#75BCFF" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

export function PipTail({ id }: { id: string }) {
  const curve = 'M109 211C64 234 26 203 36 166c7-28 24-41 22-66'
  return (
    <g className="pip-tail" data-part="tail">
      <path d={curve} fill="none" stroke="#244E82" strokeWidth="39" strokeLinecap="round" />
      <path d={curve} fill="none" stroke={`url(#${id}-tail)`} strokeWidth="34" strokeLinecap="round" />
      <path d={curve} fill="none" stroke="#C8E6FF" strokeWidth="34" strokeDasharray="17 21" strokeDashoffset="-7" />
      <path d="M58 108v-8" stroke="#284F7A" strokeWidth="35" strokeLinecap="round" />
      <path d="M46 158c-8 20-8 30 2 40" fill="none" stroke="#EDF8FF" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

function Paw({ id, side }: { id: string; side: 'left' | 'right' }) {
  return (
    <g className={`pip-arm pip-arm--${side}`} data-part={`arm-${side}`}>
      <path d="M99 161c-9-3-15 4-17 16l-4 16c-2 13 4 20 13 18 11-2 15-19 18-31 2-10-2-17-10-19Z" fill={`url(#${id}-coat)`} />
      <path d="M79 189c7-5 19-2 23 4 0 11-5 20-13 21-9 1-14-10-10-25Z" fill={`url(#${id}-dark)`} />
      <path d="m84 201 1 5m5-5v6m5-6-1 5" stroke="#89B2DC" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

export function PipBody({ id }: { id: string }) {
  return (
    <>
      <g className="pip-body" data-part="body">
        <path d="M103 150c-16 17-19 47-11 67 6 14 25 17 44 17s39-3 44-17c8-22 3-49-14-67Z" fill={`url(#${id}-dark)`} />
        <path d="M112 156c-9 12-11 34-3 45 7 10 41 10 49 0 7-11 5-33-4-45Z" fill={`url(#${id}-coat)`} />
        <path d="m123 166 11 7 12-7-4 17h-14Z" fill="#D9EFFF" opacity=".9" />
        <path d="M102 213q33 9 67 0" fill="none" stroke="#5379A4" strokeOpacity=".45" strokeWidth="2" />
      </g>
      <g className="pip-foot pip-foot--left" data-part="foot-left">
        <path d="M100 217c-12 1-19 9-17 17 7 6 25 7 38 1l-1-15Z" fill={`url(#${id}-dark)`} />
        <path d="m91 231 5 1m3-2 5 1" stroke="#91B7DB" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="pip-foot pip-foot--right" data-part="foot-right">
        <path d="M165 217c12 1 19 9 17 17-7 6-25 7-38 1l1-15Z" fill={`url(#${id}-dark)`} />
        <path d="m174 231-5 1m-3-2-5 1" stroke="#91B7DB" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </>
  )
}

export function PipArms({ id }: { id: string }) {
  return <><Paw id={id} side="left" /><g transform="translate(269 0) scale(-1 1)"><Paw id={id} side="right" /></g></>
}

export function PipEffects({ mood }: { mood: PipPose | PipReaction }) {
  if (mood === 'sleep') return (
    <g className="pip-dreams" fill="#A4D8FF" aria-hidden="true">
      {[0, 1, 2].map((i) => <path key={i} className="pip-dream" style={{ '--i': i } as CSSProperties} d="M192 97h11l-11 12h11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
    </g>
  )
  if (mood === 'think') return (
    <g className="pip-thoughts" fill="#BCE5FF" aria-hidden="true">
      {[0, 1, 2].map((i) => <circle key={i} className="pip-thought" cx={208 + i * 9} cy={65 - i * 14} r={3 + i} style={{ '--i': i } as CSSProperties} />)}
    </g>
  )
  if (mood === 'idle' || mood === 'stretch' || mood === 'yawn' || mood === 'nod') return null
  if (mood === 'dance') return (
    <g className="pip-music" fill="#BCE5FF" aria-hidden="true">
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${i ? 218 : 44} ${i ? 96 : 64})`}>
          <g className="pip-note" style={{ '--i': i, '--drift': `${i ? 6 : -6}px` } as CSSProperties}>
            <path d="M0 0v-19l13-3v17h-3v-12L3-15V0Z" />
            <ellipse cx="-2" rx="5" ry="3.5" /><ellipse cx="8" cy="-5" rx="5" ry="3.5" />
          </g>
        </g>
      ))}
    </g>
  )
  if (mood === 'flex') return (
    <g className="pip-strength-marks" fill="none" stroke="#FFE5A0" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="m48 124-8-4m12-7-4-7m157 14 8-4m-12-7 4-7" />
    </g>
  )
  const love = mood === 'love'
  return (
    <g className={`pip-particles${love ? ' pip-particles--hearts' : ''}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${[49, 213, 76, 192][i]} ${[104, 104, 53, 48][i]})`}>
          <g className="pip-particle" style={{ '--i': i, '--drift': `${i % 2 ? 9 : -9}px` } as CSSProperties}>
            {love ? <path d="M0 5C-20-7-7-18 0-9 7-18 20-7 0 5Z" fill="#FF98BA" /> : <path d="m0-9 2.6 6.4L9 0 2.6 2.6 0 9-2.6 2.6-9 0l6.4-2.6Z" fill={i % 2 ? '#FFE5A0' : '#BAE9FF'} />}
          </g>
        </g>
      ))}
    </g>
  )
}
