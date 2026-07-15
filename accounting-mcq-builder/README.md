# TGP Test App

A simple desktop app (Windows & Mac) for building multiple-choice accounting
test templates to use during screen-share interviews.

Stage 1 (Test Builder) and Stage 2 (Run Test + PDF Report) are both included.

## What it does

**Build Tests tab**

- Create, edit, and delete test templates.
- Each test has a title and a list of questions. Every question is either:
  - **Multiple Choice** — 4 answer options (A-D) with one marked as correct, or
  - **Text Answer** — the candidate types their answer into a text box
    instead. There's no automatic right/wrong for these (a computer can't
    grade free text), so they don't count toward the score — you read the
    candidate's typed answer yourself in the results report.
- Duplicate a question or an entire test.
- Export a test to a `.json` file, or as a `.csv` file (handy for backing up
  or moving your tests to another computer — see "Importing tests from other
  formats" below for the column format), and import either kind back in.
- Import questions from other sources too — see "Importing tests from other
  formats" below.
- Everything is saved automatically, locally on your computer. No cloud, no
  login, no internet connection required.

**Run Test tab**

- Pick a test template. Enter the candidate's name (required), and
  optionally their phone number, email address, and date of birth — these
  only show up in the PDF report if you actually fill them in; leave any of
  them blank and they're simply omitted, no empty rows.
- All questions are shown on one page. While the candidate is answering (e.g.
  during a screen-share), no right/wrong feedback is shown, and no score or
  navigation is visible — just the plain questions and answer options (or a
  text box for Text Answer questions).
- Clicking "Submit Test" asks for confirmation first (and warns if any
  questions are still unanswered) so you don't submit by accident.
- After submitting, the candidate just sees a plain "Thank you for
  completing '<test>'" screen. Nothing else.

**Results tab**

- Every completed test attempt is saved automatically and shows up here —
  candidate name, test, date, and score (Text Answer questions aren't
  included in the score, only Multiple Choice ones).
- Click a row to see the full breakdown (what the candidate picked vs. the
  correct answer for every multiple-choice question, plus the candidate's
  typed answer for every text question) and download it as a PDF report.
- Results can be deleted individually if you no longer need to keep them.

Your test files and completed results live in your OS's standard app data
folder, e.g.:

- Mac: `~/Library/Application Support/accounting-mcq-test-builder/`
- Windows: `%APPDATA%\accounting-mcq-test-builder\`

(This folder name stays as `accounting-mcq-test-builder` even though the
app is now called "TGP Test App" — it's pinned internally so renaming the
app never orphans anything you've already saved.)

Inside there, `tests/` holds your test templates and `results/` holds every
completed candidate attempt, each as its own `.json` file — so you can also
back up the whole folder if you'd like.

## Importing tests from other formats

The "Import" button (Build Tests tab) accepts more than this app's own
`.json` export — useful if you already have tests built in Google Forms,
Zoho Forms, or a spreadsheet.

**PDF** — works well with a single-column form export where questions are
numbered "1.", "2." etc. with 4 answer options each (e.g. printing a Google
Forms or Zoho Forms quiz to PDF). This is inherently best-effort: PDF text
extraction can occasionally drop a punctuation mark (shown as a `�`
character so it's easy to spot), and — importantly — **a PDF never contains
the correct answer**, since that's only stored in the original form's
private settings, never printed anywhere a form-filler can see. Every
imported question defaults to option A as "correct" and needs the actual
right answer marked by hand afterward, same as importing from Excel/CSV
without an answer column (below). After importing a PDF, always read
through the questions once before using the test live.

**Excel (.xlsx) and CSV** — the first row must have column headers:
`Question`, `Option A`, `Option B`, `Option C`, `Option D`, and optionally
`Correct Answer` and `Question Type`. If you include the Correct Answer
column, it can be the letter (A-D), a number (1-4), or the exact text of the
correct option, and it'll be marked automatically; if you leave it out,
every question imports with option A marked correct and you mark the real
answer per question afterward, the same as the PDF flow. To import a Text
Answer question (no fixed options), put `Text` in the Question Type column
for that row and leave its option/answer columns blank — this is exactly
the format this app's own CSV export uses, so exporting a test and
importing it again (e.g. on another computer) round-trips perfectly,
including Text Answer questions.

In every case, you'll see a summary after import if anything needs a second
look.

## Running it during development

You'll need [Node.js](https://nodejs.org) (18 or newer) installed once.

```bash
npm install
npm run dev
```

This opens the app in a window, with live-reload while you edit the code.

## Building an installer for your own computer

To produce a real installer you can double-click to install (no dev tools
needed afterwards):

```bash
# On a Mac, to build the Mac installer:
npm run dist:mac

# On Windows, to build the Windows installer:
npm run dist:win
```

The installer will be created in the `dist/` folder. Note: Mac installers
must be built on a Mac, and Windows installers must be built on Windows (or
a Windows VM) — this is a limitation of the underlying packaging tools, not
this app.

## Tech stack

- [Electron](https://www.electronjs.org/) — packages the app as a native
  Windows/Mac application.
- [React](https://react.dev/) — the UI.
- [electron-vite](https://electron-vite.org/) — fast, low-config build
  tooling for Electron + React.
- [electron-builder](https://www.electron.build/) — produces the `.dmg`
  (Mac) and installer `.exe` (Windows).
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) — reads text out of
  imported PDFs (pure JS, no external programs required).
- [exceljs](https://github.com/exceljs/exceljs) — reads imported `.xlsx`
  files.

No database, no backend server, no accounts — test data is plain JSON files
on your own machine.

## Branding

The app uses the Terra Global Partners color palette and logo. The logo
files were extracted directly from the brand guide PDF (page 7) since the
original logo image files weren't available to embed directly — if you have
the official source logo files (ideally PNG with a transparent background),
you can drop them in at `src/renderer/src/assets/logo-icon.png` (small
square icon, used in the nav bar) and `src/renderer/src/assets/logo-lockup.png`
(icon + wordmark, used on the candidate screens and the PDF report) to
replace the extracted versions — same filenames, so nothing else needs to
change.
