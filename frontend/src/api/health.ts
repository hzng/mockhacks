const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export type HealthStatus = {
  status: string
  database: string
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await fetch(`${apiBaseUrl}/api/health`)
  if (!response.ok) throw new Error(`API returned ${response.status}`)
  return response.json() as Promise<HealthStatus>
}
