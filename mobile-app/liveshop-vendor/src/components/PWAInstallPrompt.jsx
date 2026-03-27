import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent))
  const [isStandalone] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
  )

  useEffect(() => {
    // Already installed → never show
    if (isStandalone) return

    // Already shown this session → don't show again
    if (sessionStorage.getItem('pwa_prompt_shown')) return

    // User dismissed before → don't show until next login
    if (sessionStorage.getItem('pwa_prompt_dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show once, 5s after page load
    const timer = setTimeout(() => {
      sessionStorage.setItem('pwa_prompt_shown', '1')
      setShow(true)
    }, 5000)

    const onInstalled = () => setShow(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [isStandalone])

  if (!show) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('pwa_prompt_dismissed', '1')
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 inset-x-0 px-4 z-[55]">
      <div className="mx-auto max-w-sm rounded-2xl bg-gray-900 dark:bg-white px-4 py-3 shadow-lg flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/10 dark:bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-white dark:text-gray-900" />
        </div>
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <p className="text-xs text-white/70 dark:text-gray-500">
              <span className="font-semibold text-white dark:text-gray-900">Installer</span> — Partager → Écran d'accueil
            </p>
          ) : (
            <p className="text-sm font-medium text-white dark:text-gray-900">Installer l'app</p>
          )}
        </div>
        {deferredPrompt && !isIOS && (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold flex-shrink-0"
          >
            Installer
          </button>
        )}
        <button onClick={handleClose} className="p-1 text-white/30 dark:text-gray-300 flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
