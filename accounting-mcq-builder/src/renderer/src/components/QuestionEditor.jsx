import React from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionEditor({ question, index, onChange, onDelete, onDuplicate }) {
  const type = question.type === 'text' ? 'text' : 'mcq'

  const setText = (text) => onChange({ ...question, text })

  const setType = (nextType) => onChange({ ...question, type: nextType })

  const setOption = (i, value) => {
    const options = [...question.options]
    options[i] = value
    onChange({ ...question, options })
  }

  const setCorrect = (i) => onChange({ ...question, correctIndex: i })

  const isIncomplete =
    !question.text.trim() || (type === 'mcq' && question.options.some((o) => !o.trim()))

  return (
    <div className="question-card">
      <div className="question-card-header">
        <span className="question-number">Q{index + 1}</span>
        <div className="question-type-toggle">
          <button
            className={type === 'mcq' ? 'active' : ''}
            onClick={() => setType('mcq')}
          >
            Multiple Choice
          </button>
          <button
            className={type === 'text' ? 'active' : ''}
            onClick={() => setType('text')}
          >
            Text Answer
          </button>
        </div>
        {isIncomplete && <span className="badge-warning">Incomplete</span>}
        <div className="question-card-actions">
          <button title="Duplicate question" onClick={onDuplicate}>
            ⧉
          </button>
          <button title="Delete question" onClick={onDelete}>
            ✕
          </button>
        </div>
      </div>

      <textarea
        className="question-text"
        placeholder="Type the question here..."
        value={question.text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
      />

      {type === 'mcq' ? (
        <>
          <div className="options-list">
            {question.options.map((opt, i) => (
              <div className="option-row" key={i}>
                <label className="option-radio">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === i}
                    onChange={() => setCorrect(i)}
                    title="Mark as correct answer"
                  />
                  <span>{LETTERS[i]}</span>
                </label>
                <input
                  type="text"
                  className="option-input"
                  placeholder={`Option ${LETTERS[i]}`}
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="option-hint">Select the radio button next to the correct answer.</div>
        </>
      ) : (
        <div className="text-answer-hint">
          The candidate will type their answer in a text box instead of picking from options.
          There's no automatic right/wrong for this question — it won't count toward the score,
          and you'll read the candidate's typed answer yourself in the results report.
        </div>
      )}
    </div>
  )
}
