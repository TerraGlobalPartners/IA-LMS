import React from 'react'
import logoLockup from '../assets/logo-lockup.png'

const LETTERS = ['A', 'B', 'C', 'D']

function scoreTest(test, answers) {
  let correct = 0
  let scoredTotal = 0
  const rows = test.questions.map((q) => {
    const selected = answers[q.id]
    if (q.type === 'text') {
      return { question: q, selected, isCorrect: null }
    }
    scoredTotal += 1
    const isCorrect = selected === q.correctIndex
    if (isCorrect) correct += 1
    return { question: q, selected, isCorrect }
  })
  const textCount = test.questions.length - scoredTotal
  return { correct, total: scoredTotal, textCount, rows }
}

export default function ResultsScreen({
  test,
  candidateName,
  candidatePhone,
  candidateEmail,
  candidateDob,
  submittedAt,
  answers,
  onDownloadPdf,
  onBack,
  backLabel = 'Back'
}) {
  const { correct, total, textCount, rows } = scoreTest(test, answers)
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  const dateStr = new Date(submittedAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const dobStr = candidateDob
    ? new Date(candidateDob).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : ''

  return (
    <div className="results-screen">
      <div className="results-actions no-print">
        <button className="btn btn-primary" onClick={onDownloadPdf}>
          Download PDF Report
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          {backLabel}
        </button>
      </div>

      <div className="report-printable">
        <div className="report-header">
          <img className="report-logo" src={logoLockup} alt="Terra Global Partners" />
          <div>
            <h2>{test.title}</h2>
            <div className="report-meta">
              <span>Candidate: {candidateName}</span>
              <span>Date: {dateStr}</span>
              {candidatePhone && <span>Phone: {candidatePhone}</span>}
              {candidateEmail && <span>Email: {candidateEmail}</span>}
              {dobStr && <span>Date of birth: {dobStr}</span>}
            </div>
          </div>
        </div>

        <div className="report-score">
          <div className="report-score-number">
            {correct} / {total}
          </div>
          <div className="report-score-percent">{percent}%</div>
          {textCount > 0 && (
            <div className="report-score-note">
              ({textCount} text-answer question{textCount === 1 ? '' : 's'} not included in this score)
            </div>
          )}
        </div>

        <div className="report-breakdown">
          {rows.map(({ question, selected, isCorrect }, i) => {
            if (question.type === 'text') {
              return (
                <div className="report-question" key={question.id}>
                  <div className="report-question-header">
                    <span className="report-question-number">Q{i + 1}</span>
                    <span className="report-badge badge-unanswered">
                      {selected && selected.trim() ? 'Text answer' : 'Not answered'}
                    </span>
                  </div>
                  <div className="report-question-text">{question.text}</div>
                  <div className="report-text-answer">
                    {selected && selected.trim() ? selected : <em>No answer given.</em>}
                  </div>
                </div>
              )
            }
            return (
              <div className="report-question" key={question.id}>
                <div className="report-question-header">
                  <span className="report-question-number">Q{i + 1}</span>
                  <span
                    className={`report-badge ${
                      selected === undefined ? 'badge-unanswered' : isCorrect ? 'badge-correct' : 'badge-incorrect'
                    }`}
                  >
                    {selected === undefined ? 'Not answered' : isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="report-question-text">{question.text}</div>
                <div className="report-options">
                  {question.options.map((opt, i2) => {
                    const isAnswerCorrect = i2 === question.correctIndex
                    const isCandidatePick = i2 === selected
                    let cls = 'report-option'
                    if (isAnswerCorrect) cls += ' report-option-correct'
                    if (isCandidatePick && !isAnswerCorrect) cls += ' report-option-wrong'
                    return (
                      <div className={cls} key={i2}>
                        <span className="report-option-letter">{LETTERS[i2]}</span>
                        <span className="report-option-text">{opt}</span>
                        {isAnswerCorrect && <span className="report-option-tag">Correct answer</span>}
                        {isCandidatePick && <span className="report-option-tag">Candidate's answer</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
