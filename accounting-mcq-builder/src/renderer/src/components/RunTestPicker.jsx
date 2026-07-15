import React, { useState } from 'react'

export default function RunTestPicker({ tests, onStart }) {
  const [selectedId, setSelectedId] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [candidateDob, setCandidateDob] = useState('')

  const canStart = Boolean(selectedId) && candidateName.trim().length > 0

  const handleStart = () => {
    if (!canStart) return
    onStart(selectedId, {
      name: candidateName.trim(),
      phone: candidatePhone.trim(),
      email: candidateEmail.trim(),
      dob: candidateDob.trim()
    })
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

          <label className="run-name-label" htmlFor="candidate-phone">
            Phone number <span className="run-optional-tag">(optional)</span>
          </label>
          <input
            id="candidate-phone"
            className="run-name-input"
            type="text"
            placeholder="e.g. +44 7700 900000"
            value={candidatePhone}
            onChange={(e) => setCandidatePhone(e.target.value)}
          />

          <label className="run-name-label" htmlFor="candidate-email">
            Email address <span className="run-optional-tag">(optional)</span>
          </label>
          <input
            id="candidate-email"
            className="run-name-input"
            type="text"
            placeholder="e.g. jane@example.com"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
          />

          <label className="run-name-label" htmlFor="candidate-dob">
            Date of birth <span className="run-optional-tag">(optional)</span>
          </label>
          <input
            id="candidate-dob"
            className="run-name-input"
            type="date"
            value={candidateDob}
            onChange={(e) => setCandidateDob(e.target.value)}
          />

          <button className="btn btn-primary run-start-btn" disabled={!canStart} onClick={handleStart}>
            Start Test
          </button>
        </div>
      )}
    </div>
  )
}
