import { app } from 'electron'
import { join, extname } from 'path'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { parsePdfQuestions } from './pdfImport'
import { parseCsvQuestions, parseExcelQuestions } from './excelImport'

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
    // Older test files predate the "type" field - absence means a regular
    // multiple-choice question, same as it always was.
    if (q.type === 'text') continue
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
    questions: (test.questions || []).map((q) => ({ ...q, type: q.type === 'text' ? 'text' : 'mcq' }))
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

const REVIEW_ANSWERS_WARNING =
  'This file did not tell us which answer is correct for each question, so every question defaulted to option A. Please go through and mark the correct answer for each one.'

async function importTestFromFile(filePath) {
  const ext = extname(filePath).toLowerCase()
  const now = new Date().toISOString()
  let title
  let questions
  let warning

  if (ext === '.json') {
    const raw = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(raw)
    if (!isValidTestShape(data)) {
      throw new Error('That file is not a valid test template.')
    }
    title = data.title
    questions = data.questions
  } else if (ext === '.pdf') {
    const result = await parsePdfQuestions(filePath)
    title = result.title
    questions = result.questions
    const notes = [
      'PDF import is best-effort. Please review every question — look for any "�" marks (a character the PDF didn\'t extract cleanly and needs retyping), and mark the correct answer for each question (PDFs never contain that information).'
    ]
    if (result.incompleteCount > 0) {
      notes.unshift(`${result.incompleteCount} question(s) did not have exactly 4 options and may need fixing.`)
    }
    warning = notes.join(' ')
  } else if (ext === '.xlsx' || ext === '.xls') {
    const result = await parseExcelQuestions(filePath)
    title = result.title
    questions = result.questions
    if (!result.hasCorrectColumn) warning = REVIEW_ANSWERS_WARNING
  } else if (ext === '.csv') {
    const result = await parseCsvQuestions(filePath)
    title = result.title
    questions = result.questions
    if (!result.hasCorrectColumn) warning = REVIEW_ANSWERS_WARNING
  } else {
    throw new Error('Unsupported file type. Please choose a .json, .pdf, .xlsx, or .csv file.')
  }

  const test = {
    id: randomUUID(),
    title: title || 'Imported Test',
    createdAt: now,
    updatedAt: now,
    questions: questions.map((q) => ({
      id: randomUUID(),
      text: q.text,
      type: q.type === 'text' ? 'text' : 'mcq',
      options: q.type === 'text' ? ['', '', '', ''] : q.options,
      correctIndex: q.type === 'text' ? 0 : q.correctIndex ?? 0
    }))
  }
  const dir = ensureTestsDir()
  await fs.writeFile(join(dir, `${test.id}.json`), JSON.stringify(test, null, 2), 'utf-8')
  return { test, warning }
}

function scoreOf(result) {
  const scored = result.questions.filter((q) => q.type !== 'text')
  const correct = scored.filter((q) => result.answers[q.id] === q.correctIndex).length
  return { correct, total: scored.length }
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
    candidatePhone: result.candidatePhone || '',
    candidateEmail: result.candidateEmail || '',
    candidateDob: result.candidateDob || '',
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
