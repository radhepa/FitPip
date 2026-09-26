import { useState } from 'react'
import { ActivityBadges } from '../components/ActivityBadges'
import { ErrorBanner, Loading } from '../components/feedback'
import { GroupRanks } from '../components/GroupRanks'
import { HowRanksWork } from '../components/HowRanksWork'
import { LiftBadges } from '../components/LiftBadges'
import { PageHeader } from '../components/PageHeader'
import { ProfileEditSheet } from '../components/ProfileEditSheet'
import { ProfileHero } from '../components/ProfileHero'
import { ProfileSetupCard } from '../components/ProfileSetupCard'
import { ProfileTotals } from '../components/ProfileTotals'
import { StrengthMap } from '../components/StrengthMap'
import { useProfile } from '../hooks/useProfile'
import { useSettings } from '../hooks/useSettings'

/** Ranks, badges, XP and lifetime stats, all worked out from the logged history. */
export function ProfileScreen() {
  const { unit, distanceUnit, displayName } = useSettings()
  const { profile, bodyweight, loading, error, reload } = useProfile()
  const [editing, setEditing] = useState(false)

  if (error && !profile) return <ErrorBanner error={error} onRetry={reload} />
  if (loading || !profile) return <Loading label="Working out your ranks…" />

  const needsSetup = profile.missing.sex || profile.missing.bodyweight
  const blockedReason = needsSetup ? 'Finish “Get your lifts ranked” above to see how your lifts compare.' : null

  return (
    <>
      <PageHeader eyebrow="Ranks, badges and XP" title="Profile" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="grid min-w-0 grid-cols-1 gap-4">
          <ProfileHero name={displayName} profile={profile} onEdit={() => setEditing(true)} />
          {needsSetup && <ProfileSetupCard missing={profile.missing} bodyweight={bodyweight} unit={unit} />}
          <ProfileTotals totals={profile.totals} unit={unit} />
          <StrengthMap
            muscles={profile.muscles}
            unit={unit}
            note={
              needsSetup
                ? 'Finish “Get your lifts ranked” to colour in your muscles.'
                : profile.lifts.length === 0
                  ? 'Log a lift to colour in your first muscle.'
                  : `Compared at ${bodyweight} ${unit}, your average over the last week of weigh-ins.`
            }
          />
          {profile.overall && <GroupRanks overall={profile.overall} />}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6">
          <LiftBadges lifts={profile.lifts} unranked={profile.unranked} unit={unit} blockedReason={blockedReason} />
          <ActivityBadges badges={profile.activities} distanceUnit={distanceUnit} />
          <HowRanksWork />
        </div>
      </div>

      <ProfileEditSheet open={editing} onClose={() => setEditing(false)} />
    </>
  )
}
