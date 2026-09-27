export type PipPose = 'idle' | 'cheer' | 'sleep' | 'think'
export type PipReaction = 'wave' | 'bounce' | 'love' | 'celebrate' | 'stretch' | 'dance' | 'peekaboo' | 'flex' | 'nod' | 'yawn'
/** Anything Pip can be doing: a resting pose or a two-and-a-bit-second gesture. */
export type PipMood = PipPose | PipReaction
