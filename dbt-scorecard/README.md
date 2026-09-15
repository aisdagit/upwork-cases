# Fidelis — DBT Clinical Quality Prototype

A clickable prototype of an AI-powered clinical quality platform for psychotherapy. Built with **SvelteKit + TypeScript**. All patient data, transcripts, and clinical notes are fictional demo content.

## Run it

```
cd dbt-scorecard
npm install
npm run dev -- --open
```

## Demo flow (30–60s)

1. **Sessions** (`/`) — recent therapy sessions with processing status, DBT adherence scores, and clinical notes status. Click **Patient #1842**.
2. **Session Review** (`/sessions/1842`) — tabs for Overview, Transcript, Clinical Notes, Quality Score, and Coaching.
   - **Overview**: AI summary, key observations, processing checklist, and overall DBT score. Click **Review Quality Score**.
   - **Quality Score** — the centerpiece: an overall adherence ring plus five scored DBT competencies. Click **Commitment Strategies (68%)**.
   - **Item detail**: rationale, fictional transcript evidence, what worked / what could improve. Click **View Coaching Suggestions**.
   - **Coaching**: three concrete suggestions, plus **Generate Alternative Approach** for another AI-suggested technique. **Back to Scorecard** returns to the full grid.
3. Every scorecard item is clickable (not only the flagged one), and the Transcript tab tags lines with the DBT strategy the AI detected, tying transcript evidence directly to the scorecard.

## Notes

- Only Patient #1842 has a full detail page in this demo, by design — see the prompt's "don't build an entire platform" instruction. Other dashboard rows render but are not links.
- No real names, emails, or phone numbers appear anywhere in the app, per request.
- Subtle compliance cues (encrypted/access-logged badge, role-based access, audit trail nav placeholder, PHI-safe patient IDs) are included as UI signals only — the prototype does not claim HIPAA compliance.
