import { useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { Skeleton, Spinner } from '../components/ui/LoadingIndicator'
import { Progress } from '../components/ui/Progress'
import { SelectInput } from '../components/ui/SelectInput'
import { Switch } from '../components/ui/Switch'
import { TextArea } from '../components/ui/TextArea'
import { TextInput } from '../components/ui/TextInput'

export function UiShowcasePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="showcase-page">
      <div className="page-heading">
        <p className="eyebrow">Developer tool · styling</p>
        <h1>UI component preparation</h1>
        <p className="lede">A quick reference for reusable components, interactive states, and light and dark color themes.</p>
      </div>

      <section className="showcase-section">
        <h2>Actions</h2>
        <Card className="showcase-card">
          <div className="component-row">
            <Button>Primary action</Button><Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet action</Button><Button disabled>Disabled</Button>
            <Button className="button-danger">Delete item</Button>
          </div>
        </Card>
      </section>

      <section className="showcase-section">
        <h2>Form controls</h2>
        <Card className="showcase-card form-demo">
          <TextInput label="Project name" placeholder="e.g. LocalLoop" />
          <TextInput label="Team email" placeholder="you@example.com" type="email" />
          <SelectInput
            defaultValue="prototype"
            label="Project stage"
            options={[
              { label: 'Choose a stage', value: '' },
              { label: 'Prototype', value: 'prototype' },
              { label: 'Building', value: 'building' },
              { label: 'Launched', value: 'launched' },
            ]}
          />
          <TextInput defaultValue="" error="Enter a valid project name." label="Validation example" />
          <TextArea hint="A short sentence is enough." label="Project summary" placeholder="What are you building?" rows={3} />
          <Checkbox defaultChecked description="You can change this later." label="Share updates with my team" />
        </Card>
      </section>

      <section className="showcase-section">
        <h2>Status and feedback</h2>
        <Card className="showcase-card">
          <div className="component-row">
            <Badge tone="success">Ready</Badge><Badge tone="warning">In progress</Badge>
            <Badge tone="danger">Blocked</Badge><Badge tone="neutral">Draft</Badge><Badge tone="info">New</Badge>
          </div>
          <div className="alert-stack">
            <Alert tone="success" title="Saved">Your changes are up to date.</Alert>
            <Alert tone="info" title="Tip">Connect the backend to load live data.</Alert>
            <Alert tone="warning" title="Needs attention">One required field is missing.</Alert>
            <Alert tone="danger" title="Could not save">Check your connection and try again.</Alert>
          </div>
          <Progress label="Setup progress" value={68} />
        </Card>
      </section>

      <section className="showcase-section">
        <h2>People and preferences</h2>
        <Card className="showcase-card">
          <div className="component-row avatar-row" aria-label="Team members">
            <Avatar name="Avery Morgan" size="small" tone="green" />
            <Avatar name="Jordan Lee" tone="blue" />
            <Avatar name="Sam Rivera" size="large" tone="violet" />
            <Avatar initials="+3" name="3 more team members" tone="orange" />
          </div>
          <Switch
            checked={notificationsEnabled}
            description="Get a message when a teammate updates this project."
            label="Email notifications"
            onChange={setNotificationsEnabled}
          />
        </Card>
      </section>

      <section className="showcase-section">
        <h2>Loading states</h2>
        <Card className="showcase-card loading-demo">
          <div className="component-row loading-indicators"><Spinner /><span className="muted">Loading your projects…</span></div>
          <div className="skeleton-card" aria-label="Loading project preview" role="status">
            <Skeleton shape="circle" />
            <div className="skeleton-lines"><Skeleton /><Skeleton className="skeleton-short" /></div>
            <Skeleton className="skeleton-block" shape="block" />
          </div>
        </Card>
      </section>

      <section className="showcase-section">
        <h2>Content and empty states</h2>
        <div className="showcase-grid">
          <Card>
            <p className="eyebrow">Example card</p><h3>Make the next step obvious</h3>
            <p className="muted">Use a card to group a small set of related information or actions.</p>
          </Card>
          <Card className="empty-state">
            <span className="empty-icon" aria-hidden="true">＋</span><h3>Nothing here yet</h3>
            <p className="muted">An empty state should explain what belongs here and what to do next.</p>
            <Button variant="secondary">Create first item</Button>
          </Card>
        </div>
      </section>
    </div>
  )
}
