/**
 * Hands a file to the person: the share sheet on a phone (Save to Files, AirDrop, mail...), a
 * download elsewhere. Resolves false if they closed the share sheet without choosing anything.
 */
export async function saveFile(file: { name: string; type: string; text: string }): Promise<boolean> {
  const blob = new Blob([file.text], { type: file.type })
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (touch && typeof File === 'function' && typeof navigator.canShare === 'function') {
    const shared = new File([blob], file.name, { type: file.type })
    if (navigator.canShare({ files: [shared] })) {
      try {
        await navigator.share({ files: [shared], title: file.name })
        return true
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return false
        // Sharing refused (no gesture, not allowed): fall back to a download.
      }
    }
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
  return true
}
