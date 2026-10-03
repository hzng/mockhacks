import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { pages } from '../config/pages'
import { Switch } from '../components/ui/Switch'
import { HomePage } from '../pages/HomePage'
import { UiShowcasePage } from '../pages/UiShowcasePage'

const developerToolsStorageKey = 'hackathon-starter:show-developer-tools'
const themeStorageKey = 'hackathon-starter:theme'
type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(themeStorageKey)
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function DeveloperToolsRoute({ enabled }: { enabled: boolean }) {
  return enabled ? <UiShowcasePage /> : <Navigate to="/" replace />
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [showDeveloperTools, setShowDeveloperTools] = useState(
    () => localStorage.getItem(developerToolsStorageKey) === 'true',
  )

  function toggleTheme(checked: boolean) {
    const nextTheme = checked ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem(themeStorageKey, nextTheme)
  }

  function toggleDeveloperTools() {
    setShowDeveloperTools((current) => {
      const next = !current
      localStorage.setItem(developerToolsStorageKey, String(next))
      return next
    })
  }

  const visiblePages = pages.filter((page) => !page.developerTool || showDeveloperTools)

  return (
    <div className="app-frame" data-theme={theme}>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Hackathon Starter home">
          <span className="brand-mark">H</span><span>Hackathon Starter</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {visiblePages.map((page) => <Link className="nav-link" key={page.path} to={page.path}>{page.label}</Link>)}
        </nav>
        <div className="topbar-tools">
          <Switch checked={theme === 'dark'} label="Dark mode" onChange={toggleTheme} />
          <label className="dev-toggle">
            <input checked={showDeveloperTools} onChange={toggleDeveloperTools} type="checkbox" />
            <span>Developer tools</span>
          </label>
        </div>
      </header>
      <main className="page-container">
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<DeveloperToolsRoute enabled={showDeveloperTools} />} path="/dev/ui" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </main>
    </div>
  )
}
