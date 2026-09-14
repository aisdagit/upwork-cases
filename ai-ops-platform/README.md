# OpsPilot — AI Operations Platform (Prototype)

A clickable front-end prototype for an AI-powered operations platform. No backend or build step — pure HTML/CSS/JS with mock data.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
cd ai-ops-platform
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Demo flow (30–60s)

1. **Operations Dashboard** — metrics, integration health table, activity feed, hourly volume chart. `Billing Sync` is flagged with a Warning status.
2. Click **Billing Sync** → **Integration Detail** — degraded status, error rate chart, recent errors, and an **Analyze with AI** action.
3. Click **Analyze with AI** → **AI Analysis** panel — plain-language summary, likely cause, systems affected, severity, and a suggested next action.
4. Click **Apply Suggested Action** → brief progress steps, then a success state. Status updates to **Recovering**, the Open Issues metric drops, and the fix is logged to Activity.
5. Sidebar navigation (**Dashboard**, **Integrations**, **AI Insights**, **Activity**) works throughout.
