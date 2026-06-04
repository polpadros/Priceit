'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getSupabase } from '@/lib/supabase'
import type { City } from '@/types'

interface CityContextType {
  city: City
  setCity: (c: City) => void
}

const CityContext = createContext<CityContextType>({ city: 'barcelona', setCity: () => {} })

export function CityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [city, setCityState] = useState<City>('barcelona')

  // Load preferred city from profile on login
  useEffect(() => {
    if (!user) return
    getSupabase()
      .from('profiles')
      .select('preferred_city')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferred_city) setCityState(data.preferred_city as City)
      })
  }, [user])

  async function setCity(c: City) {
    setCityState(c)
    if (user) {
      await getSupabase().from('profiles').upsert({ id: user.id, preferred_city: c })
    }
  }

  return <CityContext.Provider value={{ city, setCity }}>{children}</CityContext.Provider>
}

export const useCity = () => useContext(CityContext)
