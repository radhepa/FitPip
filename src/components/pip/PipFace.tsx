import type { PipPose, PipReaction } from './types'

function Eye({ x, side }: { x: number; side: string }) {
  return (
    <g transform={`translate(${x} 110)`}>
      <g className={`pip-eye pip-eye--${side}`}>
        <ellipse rx="10" ry="13" fill="#102039" />
        <ellipse cy="5" rx="6.5" ry="6" fill="#244B79" />
        <circle cx="-3" cy="-5" r="3.5" fill="#fff" />
        <circle cx="4" cy="4" r="1.6" fill="#B2E7FF" />
      </g>
    </g>
  )
}

export function PipFace({ id, mood }: { id: string; mood: PipPose | PipReaction }) {
  const happy = mood === 'cheer' || mood === 'bounce' || mood === 'love' || mood === 'celebrate'
  const asleep = mood === 'sleep'
  return (
    <>
      <g className="pip-ear pip-ear--left" data-part="ear-left">
        <path d="M78 83C62 74 60 48 68 35c21 0 39 13 44 31Z" fill={`url(#${id}-dark)`} />
        <path d="M79 70c-9-9-10-20-7-26 13 2 23 11 26 19Z" fill="#BCDFF8" />
        <path d="m77 57 9 7-7 1" fill="#EBF7FF" />
      </g>
      <g className="pip-ear pip-ear--right" data-part="ear-right">
        <path d="M163 66c8-21 26-31 45-29 7 18 1 37-14 47Z" fill={`url(#${id}-dark)`} />
        <path d="M179 65c5-11 14-17 23-19 2 10-3 20-12 27Z" fill="#BCDFF8" />
        <path d="m196 56-9 8 8 1" fill="#EBF7FF" />
      </g>
      <g className="pip-band-ties" data-part="band-ties">
        <path d="m196 86 33 9-9 9-22-8Z" fill="#8BD9F6" />
        <path d="m198 89 22 24-12 3-15-20Z" fill="#BAEFFF" />
      </g>
      <path d="M74 88c4-32 25-49 62-49s62 21 64 51l9 20-9 1 7 15-13-1c-7 25-31 40-59 40-31 0-54-15-61-40l-13 1 8-14-9-2Z" fill={`url(#${id}-coat)`} />
      <path d="M103 57q24-13 43-8" fill="none" stroke="#BCE5FF" strokeOpacity=".48" strokeWidth="5" strokeLinecap="round" />
      <path d="M74 81q60-25 125 0l1 13q-63-23-128 0Z" fill="#B8EFFF" />
      <path d="M75 83q60-24 122 0" fill="none" stroke="#E5FAFF" strokeWidth="2" />
      <path d="m133 72 6 7-6 7-6-7Z" fill="#599ED2" />
      <path d="M82 104c3-19 17-25 30-17 13 8 13 25 5 39-19 6-30-3-35-22ZM188 104c-3-19-17-25-30-17-13 8-13 25-5 39 19 6 30-3 35-22Z" fill={`url(#${id}-cream)`} />
      <path d="m92 119 22-1-5 22ZM178 119l-22-1 5 22Z" fill="#326CAC" />
      <path d="M87 135c6-16 29-20 48-8 19-12 42-8 48 8-8 17-26 24-48 24s-40-7-48-24Z" fill={`url(#${id}-cream)`} />
      <g className="pip-blush" fill="#E89BBD" opacity=".65">
        <ellipse cx="87" cy="127" rx="9" ry="4.5" /><ellipse cx="183" cy="127" rx="9" ry="4.5" />
      </g>
      <g className="pip-brows" fill="none" stroke="#275A94" strokeWidth="3.5" strokeLinecap="round">
        <path d="m96 91 12-2" /><path className="pip-brow--right" d="m160 89 12 2" />
      </g>
      <g className="pip-gaze" data-part="eyes">
        {asleep ? (
          <path d="M96 113q9 8 18 0m42 0q9 8 18 0" fill="none" stroke="#172B46" strokeWidth="4" strokeLinecap="round" />
        ) : happy ? (
          <path d="M95 114q10-15 20 0m40 0q10-15 20 0" fill="none" stroke="#172B46" strokeWidth="4.5" strokeLinecap="round" />
        ) : (
          <g className="pip-eye-drift"><Eye x={105} side="left" /><Eye x={165} side="right" /></g>
        )}
      </g>
      <g data-part="mouth">
        <path d="M128 131q7-4 14 0c0 4-4 7-7 7s-7-3-7-7Z" fill="#102039" />
        <path d="m131 131 4-1" stroke="#759ABF" strokeWidth="1.8" strokeLinecap="round" />
        {happy ? (
          <g className="pip-smile">
            <path d="M123 142q12 6 24 0c-1 18-22 18-24 0Z" fill="#16253E" />
            <path d="M127 151q8-7 16 0-8 8-16 0" fill="#F1A8BD" />
          </g>
        ) : asleep ? (
          <ellipse className="pip-snore" cx="135" cy="146" rx="3.5" ry="4" fill="#284A70" />
        ) : (
          <path className="pip-smile" d="M124 143q6 6 11-1 5 7 11 1" fill="none" stroke="#203A58" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </g>
    </>
  )
}
