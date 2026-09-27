export type PipPose = 'idle' | 'cheer' | 'sleep' | 'think'
export type PipCelebrationReaction = 'celebrate' | 'high-five' | 'victory-dance' | 'strong-finish' | 'heart-hug'
export type PipReaction = 'celebrate' | 'wave' | 'bounce' | 'love' | 'stretch' | 'dance' | 'peekaboo' | 'flex' | 'nod' | 'yawn'
/** Poses and gestures available to Pip's everyday conversation. */
export type PipMood = PipPose | PipReaction
/** Workout finales have their own timing and messages, outside the everyday speech banks. */
export type PipVisualMood = PipMood | PipCelebrationReaction
