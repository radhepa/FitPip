interface Props {
  completed: number
  target?: number
}

const strokes = [
  'M3 3.5 2.6 18.5',
  'M8 2.5 8.4 18',
  'M13 3 12.6 18.5',
  'M18 2.5 18.4 18',
] as const

export function TallyMarks({ completed, target }: Props) {
  const shown = Math.max(completed, target ?? 1)
  const groups = Array.from({ length: Math.ceil(shown / 5) }, (_, group) => {
    const count = Math.min(5, Math.max(0, shown - group * 5))
    const done = Math.min(5, Math.max(0, completed - group * 5))
    return { count, done }
  })
  const met = target !== undefined && completed >= target
  const label = target === undefined ? `${completed} sets done` : `${completed} of ${target} sets done`

  return (
    <span className={`tally ${met ? 'tally--met' : ''}`} role="img" aria-label={label}>
      {groups.map((group, groupIndex) => (
        <svg key={groupIndex} viewBox="0 0 22 22" aria-hidden="true">
          {strokes.slice(0, Math.min(group.count, 4)).map((path, index) => (
            <path key={path} d={path} className={index < group.done ? 'tally-done' : 'tally-open'} />
          ))}
          {group.count === 5 && <path d="M1 16.5 20 4" className={group.done === 5 ? 'tally-done' : 'tally-open'} />}
        </svg>
      ))}
    </span>
  )
}
