import type { Exercise } from '../types/db'

/** Demo GIF and how-to steps for exercises that came from ExerciseDB. Renders nothing for custom ones. */
export function ExerciseGuide({ exercise }: { exercise: Pick<Exercise, 'name' | 'image_url' | 'instructions' | 'external_id'> }) {
  if (!exercise.image_url && exercise.instructions.length === 0) return null

  return (
    <section className="card mb-6 p-4">
      {exercise.image_url && (
        <img
          src={exercise.image_url}
          alt={`${exercise.name} demonstration`}
          width={180}
          height={180}
          referrerPolicy="no-referrer"
          className="mx-auto mb-3 size-44 rounded-xl bg-white object-contain"
        />
      )}
      {exercise.instructions.length > 0 && (
        <details>
          <summary className="min-h-11 cursor-pointer py-2 font-extrabold">How to do it</summary>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            {exercise.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </details>
      )}
      {exercise.external_id && <p className="mt-2 text-xs text-muted">Demo and steps from ExerciseDB.</p>}
    </section>
  )
}
