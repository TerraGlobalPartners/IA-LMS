import React, { useCallback, useEffect, useState } from 'react'
import RunTestPicker from './components/RunTestPicker'
import TestRunner from './components/TestRunner'
import SubmitConfirmModal from './components/SubmitConfirmModal'
import ResultsScreen from './components/ResultsScreen'

export default function RunView() {
  const [step, setStep] = useState('picker') // picker | running | results
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [answers, setAnswers] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [exportNotice, setExportNotice] = useState(null)

  const refreshList = useCallback(async () => {
    const list = await window.api.listTests()
    setTests(list)
  }, [])

  useEffect(() => {
    refreshList()
  }, [refreshList])

  useEffect(() => {
    if (!exportNotice) return
    const t = setTimeout(() => setExportNotice(null), 3500)
    return () => clearTimeout(t)
  }, [exportNotice])

  const startTest = useCallback(async (testId, name) => {
    const test = await window.api.getTest(testId)
    setSelectedTest(test)
    setCandidateName(name)
    setAnswers({})
    setStep('running')
  }, [])

  const setAnswer = useCallback((questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }, [])

  const answeredCount = selectedTest
    ? selectedTest.questions.filter((q) => answers[q.id] !== undefined).length
    : 0

  const requestSubmit = useCallback(() => {
    setConfirmOpen(true)
  }, [])

  const confirmSubmit = useCallback(() => {
    setConfirmOpen(false)
    setStep('results')
  }, [])

  const runAnother = useCallback(() => {
    setSelectedTest(null)
    setCandidateName('')
    setAnswers({})
    setStep('picker')
    refreshList()
  }, [refreshList])

  const downloadReport = useCallback(async () => {
    const result = await window.api.exportReportPdf({
      testTitle: selectedTest.title,
      candidateName
    })
    if (result.canceled) return
    if (result.error) {
      setExportNotice(`Could not save PDF: ${result.error}`)
      return
    }
    setExportNotice('PDF report saved.')
  }, [selectedTest, candidateName])

  return (
    <div className="run-view">
      {step === 'picker' && <RunTestPicker tests={tests} onStart={startTest} />}

      {step === 'running' && selectedTest && (
        <TestRunner
          test={selectedTest}
          candidateName={candidateName}
          answers={answers}
          answeredCount={answeredCount}
          onAnswer={setAnswer}
          onSubmit={requestSubmit}
        />
      )}

      {step === 'results' && selectedTest && (
        <ResultsScreen
          test={selectedTest}
          candidateName={candidateName}
          answers={answers}
          onDownloadPdf={downloadReport}
          onRunAnother={runAnother}
        />
      )}

      {confirmOpen && selectedTest && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          totalCount={selectedTest.questions.length}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmSubmit}
        />
      )}

      {exportNotice && <div className="toast no-print">{exportNotice}</div>}
    </div>
  )
}
