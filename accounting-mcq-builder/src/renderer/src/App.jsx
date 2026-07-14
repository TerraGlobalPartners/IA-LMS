import React, { useEffect, useState } from 'react'
import BuilderView from './BuilderView'
import RunView from './RunView'
import ResultsHistoryView from './ResultsHistoryView'
import logoIcon from './assets/logo-icon.png'

const TABS = [
  { id: 'build', label: 'Build Tests' },
  { id: 'run', label: 'Run Test' },
  { id: 'results', label: 'Results' }
]

export default function App() {
  const [mode, setMode] = useState('build')
  const [version, setVersion] = useState(null)
  const [candidateFacing, setCandidateFacing] = useState(false)

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  return (
    <div className="app">
      {!candidateFacing && (
        <div className="app-nav no-print">
          <div className="app-nav-left">
            <img className="app-nav-logo" src={logoIcon} alt="Terra Global Partners" />
            <div className="app-nav-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`app-nav-tab ${mode === tab.id ? 'active' : ''}`}
                  onClick={() => setMode(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {version && <div className="app-nav-version">v{version}</div>}
        </div>
      )}
      <div className="app-content">
        {mode === 'build' && <BuilderView />}
        {mode === 'run' && <RunView onCandidateFacingChange={setCandidateFacing} />}
        {mode === 'results' && <ResultsHistoryView />}
      </div>
    </div>
  )
}
