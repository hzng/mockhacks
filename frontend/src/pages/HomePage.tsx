import { HealthStatus } from '../components/HealthStatus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function HomePage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Reusable project foundation</p>
        <h1>Start with the plumbing ready.</h1>
        <p className="lede">A small React frontend, a Python API, and a Supabase database connection point. Add the hackathon idea when the prompt arrives.</p>
        <div className="button-row">
          <Button>Get started</Button>
          <a className="text-link" href="http://localhost:8000/docs" rel="noreferrer" target="_blank">Open API docs <span aria-hidden="true">↗</span></a>
        </div>
        <HealthStatus />
      </div>
      <div className="stack-card-wrap">
        <Card className="stack-card">
          <div className="stack-card-heading"><span className="status-dot" /><span>Starter stack</span></div>
          <ul className="stack-list">
            <li><span>Frontend</span><strong>React + Vite</strong></li>
            <li><span>API</span><strong>FastAPI</strong></li>
            <li><span>Database</span><strong>Supabase Postgres</strong></li>
          </ul>
          <p className="muted">Turn on Developer tools to open the UI component showcase.</p>
        </Card>
      </div>
    </section>
  )
}
