# Quickstart: Child Development Score

**Branch**: `001-child-dev-score` | **Date**: 2026-03-22

Use this guide to get the app running locally from scratch.

---

## Prerequisites

- Node.js 20 LTS or later (`node --version`)
- npm 9+ (comes with Node.js)
- An Anthropic API key (for the AI explanation feature)

---

## 1. Clone and install

```bash
git clone <repo-url>
cd HooHacks26
npm install
```

---

## 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> ⚠️ Never commit `.env`. It is listed in `.gitignore`.

---

## 3. Verify the data file

Confirm `data/mock_data.json` exists and contains the five ZIP codes:

```bash
node -e "const d = require('./data/mock_data.json'); console.log(Object.keys(d.zip_codes))"
# Expected: [ '22101', '20190', '22003', '22015', '22030' ]
```

---

## 4. Run in development mode

```bash
npm run dev
```

This starts both the Vite dev server (frontend) and the Express AI proxy server concurrently.
Open your browser at `http://localhost:5173`.

---

## 5. Validate core user flows

### Flow 1 — Scoring works

1. Set budget: min $400k, max $700k
2. Select age group: **Child**
3. Set sliders: Education 90, Social 50, Safety 80, Infrastructure 40
4. Verify: Five neighborhood scores appear (all 0–100)
5. Move the Education slider to 20 → verify Burke and McLean scores change

### Flow 2 — Budget filter works

1. Set max budget to $500k
2. Verify: McLean (avg $1.65M), Burke ($680k), Reston ($620k), Fairfax City ($595k) —
   McLean, Burke, and Reston should be greyed out; Annandale ($520k) and Fairfax City
   should be selectable
3. Change max budget to $700k → verify Burke and Reston become interactive again

### Flow 3 — All-zero slider guard

1. Set all four sliders to 0
2. Verify: No error; all five neighborhoods display a valid score (equal-weight result)

### Flow 4 — AI explanation

1. Select Reston (20190) with any valid inputs
2. Verify: An explanation appears within 10 seconds
3. Verify: The explanation references your age group and at least one trade-off

### Flow 5 — All neighborhoods over budget

1. Set max budget to $100k
2. Verify: All five ZIPs are greyed out AND a global warning banner appears
3. Verify: Scores are still visible (not hidden)

---

## 6. Run unit tests

```bash
npm test
```

Expected: Scoring algorithm tests pass for known input/output pairs including the
zero-slider edge case.

---

## 7. Build for production

```bash
npm run build
npm start
```

The Express server will serve the compiled Vite build at `http://localhost:3000`.
