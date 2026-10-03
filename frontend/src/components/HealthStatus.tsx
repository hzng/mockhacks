import { useEffect, useState } from 'react'
import { getHealthStatus, type HealthStatus as Health } from '../api/health'

type State = { loading: true } | { loading: false; health: Health } | { loading: false; error: string }

export function HealthStatus() {
  const [state, setState] = useState<State>({ loading: true })

  useEffect(() => {
    let active = true
    getHealthStatus().then(
      (health) => { if (active) setState({ loading: false, health }) },
      () => { if (active) setState({ loading: false, error: 'API or local storage is not connected yet' }) },
    )
    return () => { active = false }
  }, [])

  if (state.loading) return <p className="health-line">Checking API and local storage…</p>
  if ('error' in state) return <p className="health-line health-offline"><span className="health-dot" />{state.error}</p>
  return <p className="health-line health-online"><span className="health-dot" />API connected · storage {state.health.storage}</p>
}
