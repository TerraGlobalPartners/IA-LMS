import React, { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import TestEditor from './components/TestEditor'

function blankTest() {
  return { title: 'Untitled Test', questions: [] }
}

export default function App() {
  const [tests, setTests] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [current, setCurrent] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const [notice, setNotice] = useState(null)
  const [version, setVersion] = useState(null)

  const currentRef = useRef(null)
  const saveTimer = useRef(null)

  currentRef.current = current

  const refreshList = useCallback(async () => {
    const list = await window.api.listTests()
    setTests(list)
    return list
  }, [])

  useEffect(() => {
    refreshList()
    window.api.getVersion().then(setVersion)
  }, [refreshList])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  const flushSave = useCallback(async () => {
    const test = currentRef.current
    if (!test) return
    setSaveStatus('saving')
    const saved = await window.api.saveTest(test)
    setCurrent(saved)
    setSaveStatus('saved')
    setTests((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id)
      const summary = {
        id: saved.id,
        title: saved.title,
        questionCount: saved.questions.length,
        updatedAt: saved.updatedAt
      }
      if (idx === -1) return [summary, ...prev]
      const next = [...prev]
      next[idx] = summary
      return next
    })
  }, [])

  const scheduleSave = useCallback(
    (next) => {
      setCurrent(next)
      setSaveStatus('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        flushSave()
      }, 600)
    },
    [flushSave]
  )

  const selectTest = useCallback(
    async (id) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        await flushSave()
      }
      setSelectedId(id)
      const test = await window.api.getTest(id)
      setCurrent(test)
      setSaveStatus('idle')
    },
    [flushSave]
  )

  const createTest = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      await flushSave()
    }
    const saved = await window.api.saveTest(blankTest())
    await refreshList()
    setSelectedId(saved.id)
    setCurrent(saved)
    setSaveStatus('idle')
  }, [flushSave, refreshList])

  const deleteTest = useCallback(
    async (id) => {
      await window.api.deleteTest(id)
      if (id === selectedId) {
        setSelectedId(null)
        setCurrent(null)
      }
      await refreshList()
      setNotice('Test deleted.')
    },
    [refreshList, selectedId]
  )

  const duplicateTest = useCallback(
    async (id) => {
      const copy = await window.api.duplicateTest(id)
      await refreshList()
      setSelectedId(copy.id)
      setCurrent(copy)
      setNotice('Test duplicated.')
    },
    [refreshList]
  )

  const exportTest = useCallback(async (id) => {
    const result = await window.api.exportTest(id)
    if (!result.canceled) {
      setNotice('Test exported.')
    }
  }, [])

  const importTest = useCallback(async () => {
    const result = await window.api.importTest()
    if (result.canceled) return
    if (result.error) {
      setNotice(`Import failed: ${result.error}`)
      return
    }
    await refreshList()
    setSelectedId(result.test.id)
    setCurrent(result.test)
    setNotice('Test imported.')
  }, [refreshList])

  return (
    <div className="app">
      <Sidebar
        tests={tests}
        selectedId={selectedId}
        version={version}
        onSelect={selectTest}
        onCreate={createTest}
        onDelete={deleteTest}
        onDuplicate={duplicateTest}
        onExport={exportTest}
        onImport={importTest}
      />
      <TestEditor test={current} saveStatus={saveStatus} onChange={scheduleSave} />
      {notice && <div className="toast">{notice}</div>}
    </div>
  )
}
