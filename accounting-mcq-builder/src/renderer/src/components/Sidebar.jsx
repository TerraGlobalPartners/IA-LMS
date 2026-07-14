import React from 'react'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Sidebar({
  tests,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onDuplicate,
  onExport,
  onImport
}) {
  const handleDelete = (e, id, title) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${title || 'this test'}"? This cannot be undone.`)) {
      onDelete(id)
    }
  }

  const handleDuplicate = (e, id) => {
    e.stopPropagation()
    onDuplicate(id)
  }

  const handleExport = (e, id) => {
    e.stopPropagation()
    onExport(id)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>My Tests</h1>
      </div>
      <div className="sidebar-actions">
        <button className="btn btn-primary" onClick={onCreate}>
          + New Test
        </button>
        <button
          className="btn btn-secondary"
          onClick={onImport}
          title="Import a test from a .json, .pdf, .xlsx, or .csv file"
        >
          Import
        </button>
      </div>
      <div className="test-list">
        {tests.length === 0 && (
          <div className="empty-hint">No tests yet. Click "New Test" to create one.</div>
        )}
        {tests.map((t) => (
          <div
            key={t.id}
            className={`test-item ${t.id === selectedId ? 'selected' : ''}`}
            onClick={() => onSelect(t.id)}
          >
            <div className="test-item-main">
              <div className="test-item-title">{t.title || 'Untitled Test'}</div>
              <div className="test-item-meta">
                {t.questionCount} question{t.questionCount === 1 ? '' : 's'} · {formatDate(t.updatedAt)}
              </div>
            </div>
            <div className="test-item-actions">
              <button title="Duplicate" onClick={(e) => handleDuplicate(e, t.id)}>
                ⧉
              </button>
              <button title="Export" onClick={(e) => handleExport(e, t.id)}>
                ⭳
              </button>
              <button title="Delete" onClick={(e) => handleDelete(e, t.id, t.title)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
