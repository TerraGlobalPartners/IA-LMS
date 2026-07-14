import React from 'react'
import logoLockup from '../assets/logo-lockup.png'

export default function ThankYouScreen({ testTitle, onDone }) {
  return (
    <div className="thankyou-screen">
      <img className="thankyou-logo" src={logoLockup} alt="Terra Global Partners" />
      <div className="thankyou-icon">✓</div>
      <h2>Thank you for completing "{testTitle}"</h2>
      <p>Your answers have been submitted.</p>
      <button className="btn btn-primary" onClick={onDone}>
        Done
      </button>
    </div>
  )
}
