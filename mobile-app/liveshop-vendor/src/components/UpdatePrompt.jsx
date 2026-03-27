import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every 30 minutes
      if (r) {
        setInterval(() => r.update(), 30 * 60 * 1000)
      }
    }
  })

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[60] px-4 pt-safe-top">
      <div className="mx-auto max-w-sm mt-3 rounded-2xl bg-gray-900 dark:bg-white px-4 py-3 shadow-lg flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-white dark:text-gray-900 flex-shrink-0" />
        <p className="flex-1 text-sm text-white dark:text-gray-900">
          Nouvelle version disponible
        </p>
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          Actualiser
        </button>
      </div>
    </div>
  )
}
