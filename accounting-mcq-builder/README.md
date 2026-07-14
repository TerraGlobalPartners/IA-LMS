# Accounting MCQ Test Builder

A simple desktop app (Windows & Mac) for building multiple-choice accounting
test templates to use during screen-share interviews.

Stage 1 (Test Builder) and Stage 2 (Run Test + PDF Report) are both included.

## What it does

**Build Tests tab**

- Create, edit, and delete test templates.
- Each test has a title and a list of questions, each with 4 answer options
  (A-D) and one marked as correct.
- Duplicate a question or an entire test.
- Export a test to a `.json` file (for backup or to move it to another
  computer) and import one back in.
- Everything is saved automatically, locally on your computer. No cloud, no
  login, no internet connection required.

**Run Test tab**

- Pick a test template and enter the candidate's name to start.
- All questions are shown on one page. While the candidate is answering (e.g.
  during a screen-share), no right/wrong feedback is shown — it's just plain
  question and answer selection.
- Clicking "Submit Test" asks for confirmation first (and warns if any
  questions are still unanswered) so you don't submit by accident.
- After submitting, you get a results screen with the overall score and a
  full breakdown of every question — what the candidate picked vs. the
  correct answer.
- "Download PDF Report" saves that results screen as a PDF you choose the
  location for, including candidate name and date.

Your test files live in your OS's standard app data folder, e.g.:

- Mac: `~/Library/Application Support/accounting-mcq-test-builder/tests/`
- Windows: `%APPDATA%\accounting-mcq-test-builder\tests\`

Each test is its own `.json` file, so you can also back up the whole folder
if you'd like.

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

No database, no backend server, no accounts — test data is plain JSON files
on your own machine.
