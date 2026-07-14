import fs from 'fs/promises'

const HEADER_Y = 765 // lines above this y are page header chrome (title/URL repeated on every page)
const FOOTER_Y = 15 // lines below this y are page footer chrome (page number/timestamp)
const WRAP_GAP_MAX = 25 // y-gap <= this = a wrapped continuation line of the same question/option
const INDENT_DIFF_MIN = 15 // x-diff beyond which a line counts as an indented option rather than question text
const KNOWN_FIELD_LABELS = ['name', 'first name', 'last name', 'email', 'email address', 'phone', 'phone number']

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

async function extractLines(doc) {
  const allLines = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const byY = new Map()
    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue
      const x = item.transform[4]
      const y = Math.round(item.transform[5])
      if (y >= HEADER_Y || y <= FOOTER_Y) continue
      if (!byY.has(y)) byY.set(y, [])
      byY.get(y).push({ x, str: item.str })
    }
    const ys = Array.from(byY.keys()).sort((a, b) => b - a) // top to bottom
    for (const y of ys) {
      const items = byY.get(y).sort((a, b) => a.x - b.x)
      const text = cleanText(items.map((i) => i.str).join(' '))
      const minX = Math.min(...items.map((i) => i.x))
      if (text) allLines.push({ text, minX, y, page: p })
    }
  }
  return allLines
}

function parseQuestionsFromLines(lines) {
  const questions = []
  const preamble = []
  let current = null // { baseX, qTextLines: [{text}], optionLines: [{text,y,page}] }
  let expecting = 1

  function finalize() {
    if (!current) return
    const questionText = current.qTextLines.map((l) => l.text).join(' ').trim()
    const options = []
    for (const line of current.optionLines) {
      const prev = options[options.length - 1]
      if (prev && line.page === prev.page && Math.abs(line.y - prev.lastY) <= WRAP_GAP_MAX) {
        prev.text += ' ' + line.text
        prev.lastY = line.y
      } else {
        options.push({ text: line.text, lastY: line.y, page: line.page })
      }
    }
    if (questionText) {
      questions.push({
        text: questionText,
        options: options.map((o) => o.text.trim())
      })
    }
    current = null
  }

  for (const line of lines) {
    if (/^submit$/i.test(line.text.trim())) break
    const m = line.text.match(/^(\d+)\.\s+(.*)$/)
    if (m && parseInt(m[1], 10) === expecting) {
      finalize()
      current = { baseX: line.minX, qTextLines: [{ text: m[2] }], optionLines: [] }
      expecting += 1
      continue
    }
    if (!current) {
      preamble.push(line.text)
      continue
    }
    const isIndented = line.minX - current.baseX >= INDENT_DIFF_MIN
    const seenOption = current.optionLines.length > 0
    if (!isIndented && !seenOption) {
      current.qTextLines.push({ text: line.text })
    } else {
      current.optionLines.push({ text: line.text, y: line.y, page: line.page })
    }
  }
  finalize()

  const title = preamble.find((line) => !KNOWN_FIELD_LABELS.includes(line.toLowerCase())) || null

  return { title, questions }
}

async function parsePdfQuestions(filePath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(await fs.readFile(filePath))
  const doc = await pdfjsLib.getDocument({ data }).promise
  const lines = await extractLines(doc)
  const { title, questions } = parseQuestionsFromLines(lines)

  if (questions.length === 0) {
    throw new Error(
      'Could not find any numbered questions in this PDF. PDF import works best with a single-column form export (like a Google Forms or Zoho Forms print-to-PDF) where questions are numbered "1.", "2." etc.'
    )
  }

  const cleanedQuestions = questions.map((q) => {
    const options = q.options.slice(0, 4)
    while (options.length < 4) options.push('')
    return { text: q.text, options, correctIndex: 0 }
  })

  const incompleteCount = questions.filter((q) => q.options.length !== 4).length

  return { title, questions: cleanedQuestions, incompleteCount }
}

export { parsePdfQuestions }
