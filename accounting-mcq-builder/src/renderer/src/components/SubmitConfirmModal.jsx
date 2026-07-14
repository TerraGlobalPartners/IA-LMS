import React from 'react'

export default function SubmitConfirmModal({ answeredCount, totalCount, onCancel, onConfirm }) {
  const allAnswered = answeredCount === totalCount

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Submit this test?</h3>
        <p>
          {allAnswered
            ? `The candidate has answered all ${totalCount} question${totalCount === 1 ? '' : 's'}.`
            : `Only ${answeredCount} of ${totalCount} questions have been answered. Unanswered questions will be marked incorrect.`}
        </p>
        <p>Once submitted, you won't be able to change any answers.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Go back
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Submit Test
          </button>
        </div>
      </div>
    </div>
  )
}
