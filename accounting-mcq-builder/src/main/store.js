import { app } from 'electron'
import { join } from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'

const testsDir = () => join(app.getPath('userData'), 'tests')
const resultsDir = () => join(app.getPath('userData'), 'results')

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

function ensureTestsDir() {
  return ensureDir(testsDir())
}

function ensureResultsDir() {
  return ensureDir(resultsDir())
}

function toSummary(test) {
  return {
    id: test.id,
    title: test.title,
    questionCount: test.questions.length,
    updatedAt: test.updatedAt
  }
}

function isValidTestShape(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.title !== 'string') return false
  if (!Array.isArray(data.questions)) return false
  for (const q of data.questions) {
    if (typeof q.text !== 'string') return false
    if (!Array.isArray(q.options) || q.options.length !== 4) return false
    if (!q.options.every((o) => typeof o === 'string')) return false
    if (
      typeof q.correctIndex !== 'number' ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    )
      return false
  }
  return true
}

async function listTests() {
  const dir = ensureTestsDir()
  const files = await fs.readdir(dir)
  const summaries = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = await fs.readFile(join(dir, file), 'utf-8')
      const test = JSON.parse(raw)
      summaries.push(toSummary(test))
    } catch {
      // skip unreadable/corrupt file
    }
  }
  summaries.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  return summaries
}

async function getTest(id) {
  const dir = ensureTestsDir()
  const raw = await fs.readFile(join(dir, `${id}.json`), 'utf-8')
  return JSON.parse(raw)
}

async function saveTest(test) {
  const dir = ensureTestsDir()
  const now = new Date().toISOString()
  const id = test.id || randomUUID()
  const full = {
    id,
    title: test.title || '',
    createdAt: test.createdAt || now,
    updatedAt: now,
    questions: test.questions || []
  }
  await fs.writeFile(join(dir, `${id}.json`), JSON.stringify(full, null, 2), 'utf-8')
  return full
}

async function deleteTest(id) {
  const dir = ensureTestsDir()
  await fs.unlink(join(dir, `${id}.json`))
}

async function duplicateTest(id) {
  const original = await getTest(id)
  const now = new Date().toISOString()
  const copy = {
    ...original,
    id: randomUUID(),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    questions: original.questions.map((q) => ({ ...q, id: randomUUID() }))
  }
  const dir = ensureTestsDir()
  await fs.writeFile(join(dir, `${copy.id}.json`), JSON.stringify(copy, null, 2), 'utf-8')
  return copy
}

async function importTestFromFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8')
  const data = JSON.parse(raw)
  if (!isValidTestShape(data)) {
    throw new Error('That file is not a valid test template.')
  }
  const now = new Date().toISOString()
  const test = {
    id: randomUUID(),
    title: data.title,
    createdAt: now,
    updatedAt: now,
    questions: data.questions.map((q) => ({
      id: randomUUID(),
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex
    }))
  }
  const dir = ensureTestsDir()
  await fs.writeFile(join(dir, `${test.id}.json`), JSON.stringify(test, null, 2), 'utf-8')
  return test
}

function scoreOf(result) {
  const correct = result.questions.filter((q) => result.answers[q.id] === q.correctIndex).length
  return { correct, total: result.questions.length }
}

function toResultSummary(result) {
  const { correct, total } = scoreOf(result)
  return {
    id: result.id,
    candidateName: result.candidateName,
    testTitle: result.testTitle,
    submittedAt: result.submittedAt,
    correct,
    total
  }
}

async function listResults() {
  const dir = ensureResultsDir()
  const files = await fs.readdir(dir)
  const summaries = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = await fs.readFile(join(dir, file), 'utf-8')
      const result = JSON.parse(raw)
      summaries.push(toResultSummary(result))
    } catch {
      // skip unreadable/corrupt file
    }
  }
  summaries.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
  return summaries
}

async function getResult(id) {
  const dir = ensureResultsDir()
  const raw = await fs.readFile(join(dir, `${id}.json`), 'utf-8')
  return JSON.parse(raw)
}

async function saveResult(result) {
  const dir = ensureResultsDir()
  const id = result.id || randomUUID()
  const full = {
    id,
    testId: result.testId,
    testTitle: result.testTitle || '',
    candidateName: result.candidateName || '',
    submittedAt: result.submittedAt || new Date().toISOString(),
    questions: result.questions || [],
    answers: result.answers || {}
  }
  await fs.writeFile(join(dir, `${id}.json`), JSON.stringify(full, null, 2), 'utf-8')
  return full
}

async function deleteResult(id) {
  const dir = ensureResultsDir()
  await fs.unlink(join(dir, `${id}.json`))
}

export {
  listTests,
  getTest,
  saveTest,
  deleteTest,
  duplicateTest,
  importTestFromFile,
  listResults,
  getResult,
  saveResult,
  deleteResult
}
