import React, { useState } from 'react'

export default function RunTestPicker({ tests, onStart }) {
  const [selectedId, setSelectedId] = useState(null)
  const [candidateName, setCandidateName] = useState('')

  const canStart = Boolean(selectedId) && candidateName.trim().length > 0

  const handleStart = () => {
    if (!canStart) return
    onStart(selectedId, candidateName.trim())
  }

  return (
    <div className="run-picker">
      <h2>Run a Test</h2>
      <p className="run-picker-subtitle">Pick a test template and enter the candidate's name to begin.</p>

      {tests.length === 0 && (
        <div className="empty-hint">
          You don't have any tests yet. Switch to "Build Tests" to create one first.
        </div>
      )}

      <div className="run-test-grid">
        {tests.map((t) => (
          <div
            key={t.id}
            className={`run-test-card ${t.id === selectedId ? 'selected' : ''}`}
            onClick={() => setSelectedId(t.id)}
          >
            <div className="run-test-card-title">{t.title || 'Untitled Test'}</div>
            <div className="run-test-card-meta">
              {t.questionCount} question{t.questionCount === 1 ? '' : 's'}
            </div>
          </div>
        ))}
      </div>

      {tests.length > 0 && (
        <div className="run-start-panel">
          <label className="run-name-label" htmlFor="candidate-name">
            Candidate name
          </label>
          <input
            id="candidate-name"
            className="run-name-input"
            type="text"
            placeholder="e.g. Jane Doe"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <button className="btn btn-primary run-start-btn" disabled={!canStart} onClick={handleStart}>
            Start Test
          </button>
        </div>
      )}
    </div>
  )
}
