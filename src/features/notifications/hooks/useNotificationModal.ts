import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useNotificationModal() {
  const navigate = useNavigate({ from: '/entities/$cui' })
  const search = useSearch({ from: '/entities/$cui' })

  const isOpen = search.notificationModal === 'open'

  const setOpen = useCallback(
    (newOpen: boolean) => {
      navigate({
        search: prev => {
          if (newOpen) {
            return { ...prev, notificationModal: 'open' as const }
          }
          const { notificationModal, ...rest } = prev
          return rest
        },
        replace: true,
        resetScroll: false,
      })
    },
    [navigate]
  )

  const openModal = useCallback(() => setOpen(true), [setOpen])
  const closeModal = useCallback(() => setOpen(false), [setOpen])

  return { isOpen, setOpen, openModal, closeModal }
}
