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
  during a screen-share), no right/wrong feedback is shown, and no score or
  navigation is visible — just the plain questions and answer options.
- Clicking "Submit Test" asks for confirmation first (and warns if any
  questions are still unanswered) so you don't submit by accident.
- After submitting, the candidate just sees a plain "Thank you for
  completing '<test>'" screen. Nothing else.

**Results tab**

- Every completed test attempt is saved automatically and shows up here —
  candidate name, test, date, and score.
- Click a row to see the full breakdown (what the candidate picked vs. the
  correct answer for every question) and download it as a PDF report.
- Results can be deleted individually if you no longer need to keep them.

Your test files and completed results live in your OS's standard app data
folder, e.g.:

- Mac: `~/Library/Application Support/accounting-mcq-test-builder/`
- Windows: `%APPDATA%\accounting-mcq-test-builder\`

Inside there, `tests/` holds your test templates and `results/` holds every
completed candidate attempt, each as its own `.json` file — so you can also
back up the whole folder if you'd like.

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
