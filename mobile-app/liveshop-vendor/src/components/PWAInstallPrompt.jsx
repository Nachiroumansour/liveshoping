import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [hidden, setHidden] = useState(true) // hidden by default, show after delay

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

    // Check snooze
    try {
      const snoozeUntil = localStorage.getItem('pwa_prompt_snooze_until')
      if (snoozeUntil && Date.now() < Number(snoozeUntil)) {
        return // stay hidden
      }
    } catch {}

    // Show prompt after 30 seconds delay (don't annoy users immediately)
    const timer = setTimeout(() => setHidden(false), 30000)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  if (isStandalone || hidden) return null

  const onInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
      setHidden(true)
    }
  }

  const onClose = () => {
    setHidden(true)
    try {
      // Snooze for 30 days
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      localStorage.setItem('pwa_prompt_snooze_until', String(Date.now() + thirtyDays))
    } catch {}
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 inset-x-0 px-4 z-[55] animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto max-w-sm rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-white dark:text-gray-900" />
        </div>
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Installer l'app</span> — Partager → Écran d'accueil
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Installer l'app</p>
              <p className="text-[11px] text-gray-400">Accès rapide et hors-ligne</p>
            </>
          )}
        </div>
        {isInstallable && !isIOS && (
          <button
            onClick={onInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            Installer
          </button>
        )}
        <button onClick={onClose} className="p-1 text-gray-300 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
