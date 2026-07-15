import fs from 'fs/promises'
import { basename, extname } from 'path'

function titleFromPath(filePath) {
  const name = basename(filePath, extname(filePath))
  return name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeHeader(cell) {
  return String(cell ?? '').trim().toLowerCase()
}

function findColumn(headers, matchers) {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]
    if (matchers.some((m) => (m instanceof RegExp ? m.test(h) : h === m))) return i
  }
  return -1
}

function resolveCorrectIndex(rawValue, options) {
  const value = String(rawValue ?? '').trim()
  if (!value) return 0
  const letterMatch = value.match(/^[a-dA-D]$/)
  if (letterMatch) return value.toUpperCase().charCodeAt(0) - 65
  const numberMatch = value.match(/^[1-4]$/)
  if (numberMatch) return parseInt(value, 10) - 1
  const idx = options.findIndex((o) => o.trim().toLowerCase() === value.toLowerCase())
  return idx >= 0 ? idx : 0
}

function questionsFromRows(rows, title) {
  if (rows.length === 0) {
    throw new Error('That file appears to be empty.')
  }
  const headers = rows[0].map(normalizeHeader)
  const questionCol = findColumn(headers, [/^question$/, /^question\s*text$/, /^prompt$/])
  const optionCols = [
    findColumn(headers, [/^option\s*a$/, /^a$/, /^choice\s*a$/, /^option\s*1$/]),
    findColumn(headers, [/^option\s*b$/, /^b$/, /^choice\s*b$/, /^option\s*2$/]),
    findColumn(headers, [/^option\s*c$/, /^c$/, /^choice\s*c$/, /^option\s*3$/]),
    findColumn(headers, [/^option\s*d$/, /^d$/, /^choice\s*d$/, /^option\s*4$/])
  ]
  const correctCol = findColumn(headers, [/^correct\s*answer$/, /^answer$/, /^correct$/, /^correct\s*option$/])
  const typeCol = findColumn(headers, [/^question\s*type$/, /^type$/])

  if (questionCol === -1 || optionCols.some((c) => c === -1)) {
    throw new Error(
      'Could not find the expected columns. The first row should have headers: Question, Option A, Option B, Option C, Option D (and optionally Correct Answer, Question Type).'
    )
  }

  const questions = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row) continue
    const text = String(row[questionCol] ?? '').trim()
    const isTextType = typeCol >= 0 && /^text$/i.test(String(row[typeCol] ?? '').trim())
    const options = isTextType ? ['', '', '', ''] : optionCols.map((c) => String(row[c] ?? '').trim())
    if (!text && options.every((o) => !o)) continue // skip blank rows
    const correctIndex = !isTextType && correctCol >= 0 ? resolveCorrectIndex(row[correctCol], options) : 0
    questions.push({ text, type: isTextType ? 'text' : 'mcq', options, correctIndex })
  }

  if (questions.length === 0) {
    throw new Error('No question rows found below the header row.')
  }

  const needsCorrectAnswerReview = questions.some((q) => q.type !== 'text') && correctCol === -1
  return { title, questions, hasCorrectColumn: !needsCorrectAnswerReview }
}

function parseCsvText(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
}

function csvField(value) {
  const str = String(value ?? '')
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function testToCsv(test) {
  const header = ['Question Type', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer']
  const lines = [header.map(csvField).join(',')]
  for (const q of test.questions) {
    const isText = q.type === 'text'
    const row = isText
      ? ['Text', q.text, '', '', '', '', '']
      : [
          'MCQ',
          q.text,
          q.options[0] || '',
          q.options[1] || '',
          q.options[2] || '',
          q.options[3] || '',
          String.fromCharCode(65 + (q.correctIndex || 0))
        ]
    lines.push(row.map(csvField).join(','))
  }
  return lines.join('\r\n') + '\r\n'
}

async function parseCsvQuestions(filePath) {
  const text = await fs.readFile(filePath, 'utf-8')
  const rows = parseCsvText(text)
  return questionsFromRows(rows, titleFromPath(filePath))
}

async function parseExcelQuestions(filePath) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.default.Workbook()
  await workbook.xlsx.readFile(filePath)
  const sheet = workbook.worksheets[0]
  if (!sheet) {
    throw new Error('That workbook has no worksheets.')
  }
  const rows = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values = row.values.slice(1) // exceljs rows are 1-indexed with a leading empty slot
    rows.push(values.map((v) => (v && typeof v === 'object' && 'text' in v ? v.text : v)))
  })
  return questionsFromRows(rows, titleFromPath(filePath))
}

export { parseCsvQuestions, parseExcelQuestions, testToCsv }
