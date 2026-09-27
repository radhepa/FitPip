/** How often to ask the server for a new version when the app comes back to the front. */
const CHECK_EVERY_MS = 60 * 60 * 1000

/**
 * Picks up new versions of the installed app. A phone can keep the app open in the background for
 * days, so it never looked for updates; and a new version took over only on the next launch. Now it
 * checks when brought back to the front (at most hourly), and once a new version has taken over it
 * reloads while the app is in the background, so it is simply there next time. Never during a workout
 * (it would lose your place on the page); the reload waits until you leave the app from elsewhere.
 */
export function watchForUpdates(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  const sw = navigator.serviceWorker
  // The very first install also "takes over" the page; that is not an update.
  const updating = !!sw.controller
  let ready = false
  let lastCheck = Date.now()
  sw.addEventListener('controllerchange', () => {
    if (updating) ready = true
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (ready && !window.location.pathname.startsWith('/workout/')) window.location.reload()
      return
    }
    if (Date.now() - lastCheck < CHECK_EVERY_MS) return
    lastCheck = Date.now()
    void sw
      .getRegistration()
      .then((registration) => registration?.update())
      .catch(() => {}) // offline: try again next time
  })
}
