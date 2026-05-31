import { useEffect, useState } from 'react'

export function useLocalStorageBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = window.localStorage.getItem(key)
    return stored !== null ? stored === 'true' : defaultValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, value ? 'true' : 'false')
  }, [key, value])

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== key) return
      if (event.newValue === null) return
      setValue(event.newValue === 'true')
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, setValue] as const
}

