import React, { useCallback, useEffect, useState } from 'react'
import ResultsScreen from './components/ResultsScreen'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ResultsHistoryView() {
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null) // full result object
  const [notice, setNotice] = useState(null)

  const refreshList = useCallback(async () => {
    const list = await window.api.listResults()
    setResults(list)
  }, [])

  useEffect(() => {
    refreshList()
  }, [refreshList])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  const openResult = useCallback(async (id) => {
    const full = await window.api.getResult(id)
    setSelected(full)
  }, [])

  const handleDelete = useCallback(
    async (e, id, candidateName) => {
      e.stopPropagation()
      if (!window.confirm(`Delete the result for "${candidateName || 'this candidate'}"? This cannot be undone.`)) {
        return
      }
      await window.api.deleteResult(id)
      await refreshList()
      setNotice('Result deleted.')
    },
    [refreshList]
  )

  const downloadReport = useCallback(async () => {
    const result = await window.api.exportReportPdf({
      testTitle: selected.testTitle,
      candidateName: selected.candidateName
    })
    if (result.canceled) return
    if (result.error) {
      setNotice(`Could not save PDF: ${result.error}`)
      return
    }
    setNotice('PDF report saved.')
  }, [selected])

  if (selected) {
    return (
      <div className="results-history">
        <ResultsScreen
          test={{ title: selected.testTitle, questions: selected.questions }}
          candidateName={selected.candidateName}
          candidatePhone={selected.candidatePhone}
          candidateEmail={selected.candidateEmail}
          candidateDob={selected.candidateDob}
          submittedAt={selected.submittedAt}
          answers={selected.answers}
          onDownloadPdf={downloadReport}
          onBack={() => setSelected(null)}
          backLabel="Back to Results List"
        />
        {notice && <div className="toast no-print">{notice}</div>}
      </div>
    )
  }

  return (
    <div className="results-history">
      <h2>Candidate Results</h2>
      <p className="run-picker-subtitle">Every completed test attempt is saved here. Click one to see the full breakdown or download the PDF.</p>

      {results.length === 0 && (
        <div className="empty-hint">No completed tests yet. Run a test from the "Run Test" tab first.</div>
      )}

      {results.length > 0 && (
        <div className="results-table">
          <div className="results-table-header">
            <span>Candidate</span>
            <span>Test</span>
            <span>Date</span>
            <span>Score</span>
            <span></span>
          </div>
          {results.map((r) => (
            <div className="results-table-row" key={r.id} onClick={() => openResult(r.id)}>
              <span className="results-table-candidate">{r.candidateName || 'Unnamed candidate'}</span>
              <span>{r.testTitle || 'Untitled Test'}</span>
              <span>{formatDate(r.submittedAt)}</span>
              <span>
                {r.correct} / {r.total}
              </span>
              <span>
                <button
                  className="results-delete-btn"
                  title="Delete"
                  onClick={(e) => handleDelete(e, r.id, r.candidateName)}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}
