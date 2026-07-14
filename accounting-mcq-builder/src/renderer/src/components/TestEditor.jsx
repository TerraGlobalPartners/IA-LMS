import React from 'react'
import QuestionEditor from './QuestionEditor'

function blankQuestion() {
  return {
    id: crypto.randomUUID(),
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0
  }
}

const SAVE_LABEL = {
  idle: '',
  saving: 'Saving…',
  saved: 'All changes saved'
}

export default function TestEditor({ test, saveStatus, onChange }) {
  if (!test) {
    return (
      <div className="editor empty-state">
        <div>
          <div className="empty-state-icon">📝</div>
          <p>Select a test from the left, or create a new one to get started.</p>
        </div>
      </div>
    )
  }

  const setTitle = (title) => onChange({ ...test, title })

  const addQuestion = () => onChange({ ...test, questions: [...test.questions, blankQuestion()] })

  const updateQuestion = (id, next) =>
    onChange({
      ...test,
      questions: test.questions.map((q) => (q.id === id ? next : q))
    })

  const deleteQuestion = (id) => {
    if (!window.confirm('Delete this question?')) return
    onChange({ ...test, questions: test.questions.filter((q) => q.id !== id) })
  }

  const duplicateQuestion = (id) => {
    const idx = test.questions.findIndex((q) => q.id === id)
    if (idx === -1) return
    const copy = { ...test.questions[idx], id: crypto.randomUUID() }
    const questions = [...test.questions]
    questions.splice(idx + 1, 0, copy)
    onChange({ ...test, questions })
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          className="title-input"
          value={test.title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="Test title"
          title="Click to rename this test"
        />
        <span className="save-status">{SAVE_LABEL[saveStatus]}</span>
      </div>

      <div className="question-list">
        {test.questions.length === 0 && (
          <div className="empty-hint">
            No questions yet. Click "+ Add Question" below to add your first one.
          </div>
        )}
        {test.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            onChange={(next) => updateQuestion(q.id, next)}
            onDelete={() => deleteQuestion(q.id)}
            onDuplicate={() => duplicateQuestion(q.id)}
          />
        ))}
      </div>

      <button className="btn btn-primary add-question-btn" onClick={addQuestion}>
        + Add Question
      </button>
    </div>
  )
}
