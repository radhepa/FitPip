import { Link } from 'react-router-dom'

export function NotFoundScreen() {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-3xl font-bold [font-variation-settings:'wdth'_82]">Page not found</h1>
      <Link to="/" className="mt-3 inline-block text-accent underline">
        Back to home
      </Link>
    </div>
  )
}
