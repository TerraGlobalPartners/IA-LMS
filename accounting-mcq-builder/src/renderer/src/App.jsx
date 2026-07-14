import React, { useEffect, useState } from 'react'
import BuilderView from './BuilderView'
import RunView from './RunView'

export default function App() {
  const [mode, setMode] = useState('build') // build | run
  const [version, setVersion] = useState(null)

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  return (
    <div className="app">
      <div className="app-nav no-print">
        <div className="app-nav-tabs">
          <button
            className={`app-nav-tab ${mode === 'build' ? 'active' : ''}`}
            onClick={() => setMode('build')}
          >
            Build Tests
          </button>
          <button
            className={`app-nav-tab ${mode === 'run' ? 'active' : ''}`}
            onClick={() => setMode('run')}
          >
            Run Test
          </button>
        </div>
        {version && <div className="app-nav-version">v{version}</div>}
      </div>
      <div className="app-content">{mode === 'build' ? <BuilderView /> : <RunView />}</div>
    </div>
  )
}
