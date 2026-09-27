import { useMemo, useState } from 'react'
import { loadTrainingWindow } from '../data/trainingWindow'
import { useAsync } from '../hooks/useAsync'
import { useSettings } from '../hooks/useSettings'
import { RANGES, weeklyVolume, type RangeDays } from '../lib/muscleVolume'
import type { Exercise } from '../types/db'
import { Chip } from './Chip'
import { ErrorBanner, Loading } from './feedback'
import { MuscleVolumePanel } from './MuscleVolumePanel'

/** The Progress screen's muscle map: weekly sets per muscle over the last 7 or 30 days. */
export function ProgressHeatmap({ exercises }: { exercises: Exercise[] }) {
  const { unit } = useSettings()
  const [days, setDays] = useState<RangeDays>(7)
  // The range travels with its data, so the map never mixes one range's sets with another's label.
  const training = useAsync(async () => ({ days, ...(await loadTrainingWindow(days)) }), [days], { cacheKey: `training:${days}` })
  const loaded = training.data

  const volume = useMemo(
    () => (loaded ? weeklyVolume({ sessions: loaded.sessions, sets: loaded.sets, exercises, days: loaded.days }) : null),
    [loaded, exercises],
  )
  const workoutDates = useMemo(() => new Map((loaded?.sessions ?? []).map((s) => [s.id, s.started_at])), [loaded])

  if (training.error && !loaded) return <ErrorBanner error={training.error} onRetry={training.reload} />
  if (!loaded || !volume) return <Loading label="Loading your muscle map…" />

  const shownDays = loaded.days
  return (
    <MuscleVolumePanel
      label="Muscle map"
      title="Weekly sets"
      caption={shownDays === 7 ? 'Sets per muscle over the last 7 days.' : 'Average sets per week over the last 30 days.'}
      volume={volume}
      unit={unit}
      periodLabel={`the last ${shownDays} days`}
      weeks={shownDays / 7}
      workoutDates={workoutDates}
      emptyText={`No sets logged in the last ${shownDays} days.`}
      action={
        <div className="flex shrink-0 gap-2" role="group" aria-label="Time range">
          {RANGES.map((range) => (
            <Chip key={range} label={`${range}d`} selected={days === range} onClick={() => setDays(range)} />
          ))}
        </div>
      }
    />
  )
}
