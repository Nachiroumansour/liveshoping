import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import pushService from '../services/pushService'

export default function PushPermissionBanner() {
  const [show, setShow] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    // Only show if push is supported and permission is not yet decided
    if (!pushService.isSupported()) return

    const permission = pushService.getPermissionStatus()
    const dismissed = sessionStorage.getItem('push_banner_dismissed')

    // Show if permission is 'default' (never asked) and not dismissed this session
    if (permission === 'default' && !dismissed) {
      // Small delay so it doesn't appear instantly
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }

    // If already granted, silently ensure subscription is synced
    if (permission === 'granted') {
      pushService.subscribe()
    }
  }, [])

  const handleEnable = async () => {
    setSubscribing(true)
    try {
      const success = await pushService.subscribe()
      if (success) {
        setShow(false)
      } else {
        // Permission was denied by user
        setShow(false)
        sessionStorage.setItem('push_banner_dismissed', '1')
      }
    } catch {
      setShow(false)
    } finally {
      setSubscribing(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('push_banner_dismissed', '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 inset-x-0 z-50 px-4 pb-2 animate-slide-up">
      <div className="mx-auto max-w-sm bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Activer les notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Recevez vos commandes en temps réel, même quand l'app est fermée.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-300 p-0.5 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleEnable}
          disabled={subscribing}
          className="w-full mt-3 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-60"
        >
          {subscribing ? 'Activation...' : 'Activer les notifications'}
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
