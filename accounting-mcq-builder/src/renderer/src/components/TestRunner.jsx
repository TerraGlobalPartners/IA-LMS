import React from 'react'
import logoLockup from '../assets/logo-lockup.png'

const LETTERS = ['A', 'B', 'C', 'D']

export default function TestRunner({
  test,
  candidateName,
  answers,
  answeredCount,
  onAnswer,
  onSubmit,
  onCancel
}) {
  const total = test.questions.length

  return (
    <div className="run-test">
      <div className="run-test-topbar">
        <img className="run-test-logo" src={logoLockup} alt="Terra Global Partners" />
        <button className="run-cancel-link" onClick={onCancel}>
          Cancel test
        </button>
      </div>

      <div className="run-test-header">
        <div>
          <h2>{test.title}</h2>
          <div className="run-test-candidate">Candidate: {candidateName}</div>
        </div>
        <div className="run-progress">
          {answeredCount} of {total} answered
        </div>
      </div>

      <div className="run-question-list">
        {test.questions.map((q, i) => (
          <div className="run-question-card" key={q.id}>
            <div className="run-question-number">Question {i + 1}</div>
            <div className="run-question-text">{q.text}</div>
            <div className="run-options-list">
              {q.options.map((opt, i2) => (
                <label className="run-option-row" key={i2}>
                  <input
                    type="radio"
                    name={`run-q-${q.id}`}
                    checked={answers[q.id] === i2}
                    onChange={() => onAnswer(q.id, i2)}
                  />
                  <span className="run-option-letter">{LETTERS[i2]}</span>
                  <span className="run-option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary submit-test-btn" onClick={onSubmit}>
        Submit Test
      </button>
    </div>
  )
}
