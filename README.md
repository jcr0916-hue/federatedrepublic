# The Federated Republic

A constitutional project — twenty articles, built from first principles.

**Live site:** https://thefederatedrepublic.org

## Structure

### Core Pages
- `index.html` — Homepage with project overview and interactive tools section
- `annotated.html` — Annotated constitution (282 provisions, 68 interactive panels)
- `states.html` — The States section
- `state-*.html` — Individual state profiles (Kailos, Arveld, Varentis, Ostmark)
- `papers.html` — Volume II essays
- `paper-*.html` — Individual essay pages
- `diagrams.html` — Constitutional diagrams
- `sources.html` — Research sources
- `discuss.html` — Discussion

### Interactive Tools (AI-Powered)
- `state-builder.html` — Generate a constitutional state portrait from eight configuration axes
- `scenario-tester.html` — Guided constitutional scenario analysis: pick an actor, action, and circumstances; receive a full constitutional ruling

### Scenarios (v126)
- `scenario-ordinary.html` — "Start Here" introduction scenario
- `scenario-weimar.html` — Historical scenario: Weimar Republic, November 1932 (15-year narrative)
- `scenario-rule-violation.html` — §2.7 Rule Violations: pattern violations, military deferral, former official lookback
- `scenario-american.html` — Long-form: The American Republic across 35 years

### Constitutional Document
- `constitution-v126.docx` — The full constitutional document (v126)

### Deployment
- `netlify.toml` — Netlify deployment configuration
- `netlify/functions/generate-portrait.js` — Serverless function: AI state portrait generation
- `netlify/functions/analyze-scenario.js` — Serverless function: AI constitutional scenario analysis

## Deployment

This site deploys automatically via Netlify when changes are pushed to `main`.

**Environment variable required:** `ANTHROPIC_API_KEY` (set in Netlify dashboard → Site configuration → Environment variables)
