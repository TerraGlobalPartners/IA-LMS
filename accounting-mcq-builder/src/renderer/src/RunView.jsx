import React, { useCallback, useEffect, useState } from 'react'
import RunTestPicker from './components/RunTestPicker'
import TestRunner from './components/TestRunner'
import SubmitConfirmModal from './components/SubmitConfirmModal'
import ThankYouScreen from './components/ThankYouScreen'

export default function RunView({ onCandidateFacingChange }) {
  const [step, setStep] = useState('picker') // picker | running | thankyou
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [answers, setAnswers] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const refreshList = useCallback(async () => {
    const list = await window.api.listTests()
    setTests(list)
  }, [])

  useEffect(() => {
    refreshList()
  }, [refreshList])

  useEffect(() => {
    onCandidateFacingChange?.(step === 'running' || step === 'thankyou')
    return () => onCandidateFacingChange?.(false)
  }, [step, onCandidateFacingChange])

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

  const confirmSubmit = useCallback(async () => {
    setConfirmOpen(false)
    await window.api.saveResult({
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      candidateName,
      submittedAt: new Date().toISOString(),
      questions: selectedTest.questions,
      answers
    })
    setStep('thankyou')
  }, [selectedTest, candidateName, answers])

  const runAnother = useCallback(() => {
    setSelectedTest(null)
    setCandidateName('')
    setAnswers({})
    setStep('picker')
    refreshList()
  }, [refreshList])

  const confirmCancelTest = useCallback(() => {
    setCancelOpen(false)
    runAnother()
  }, [runAnother])

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
          onCancel={() => setCancelOpen(true)}
        />
      )}

      {step === 'thankyou' && selectedTest && (
        <ThankYouScreen testTitle={selectedTest.title} onDone={runAnother} />
      )}

      {confirmOpen && selectedTest && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          totalCount={selectedTest.questions.length}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={confirmSubmit}
        />
      )}

      {cancelOpen && (
        <div className="modal-backdrop" onClick={() => setCancelOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel this test?</h3>
            <p>The candidate's answers so far will not be saved.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCancelOpen(false)}>
                Keep going
              </button>
              <button className="btn btn-primary" onClick={confirmCancelTest}>
                Cancel Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
