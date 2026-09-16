# ELVO — Persistent AI Companion (Prototype)

A clickable front-end prototype for ELVO, a persistent AI learning companion for children aged 6–11. No backend or build step — pure HTML/CSS/JS with scripted mock data, presented inside a mobile device frame.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
cd elvo-companion
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## What this demonstrates

The prototype's whole purpose is to make ELVO's core promise — **"the longer a child uses ELVO, the better it knows them"** — felt, not explained. A child (fictional profile: Maya, age 9) has a first voice session, mentions an upcoming science quiz and a topic she finds tricky (Saturn's rings), and leaves. When she "returns" for a later session, ELVO opens the conversation already knowing that context, without Maya repeating it, and adapts the lesson to her preferred learning style (stories). A parent-facing dashboard then shows the same progress at a high level, including a "Learning Profile" view that shows an insight being corrected/updated over time rather than fixed.

Use the **Child Experience / Parent Dashboard** toggle above the phone to jump between the two halves of the product at any time.

## Demo flow (60–90s)

**Child experience**
1. **Meet ELVO** → short onboarding: fictional profile (Maya, 9), pick an interest (Space) and a learning style (Stories) → **Start with ELVO**.
2. **First voice session** — tap the mic to step through a scripted conversation with ELVO about Saturn's rings. Maya mentions her Friday science quiz and that Saturn is the part she keeps forgetting. **End Session**.
3. **Session complete** — recap of what was covered + a "Space Explorer, Level 3" badge. **Done** → a short "see you soon" bridge screen, then **Next session** simulates Maya coming back later.
4. **Returning session (the centerpiece)** — ELVO opens by referencing the quiz and Saturn unprompted, tagged with a subtle *"Picked up from your previous session"* indicator. Maya doesn't repeat herself. ELVO then offers to continue in Maya's preferred format → **Yes!** leads into a short story-based mini-lesson (**Quiz me instead** shows it's clickable too, with a light stand-in reply).
5. **Space Adventure** — a one-question story-based quiz on Saturn's rings. Answering correctly shows learning-progress feedback → **Finish Session** → a wrap-up screen with a level-up and a direct link into the parent view.

**Parent experience**
6. **Maya's Learning** dashboard — weekly stats, per-subject progress, current interests, a plain-language learning insight, and a few examples of how ELVO is personalizing.
7. **Add School Report** → **Take Photo / Upload Report** → simulated processing → structured results (per-subject status + a suggested focus) → **View Learning Plan**.
8. **Learning Profile** — interests, learning preferences, current goals, and progress signals, including one signal shown evolving from *"Needs help remembering Saturn"* to *"Successfully recalls key Saturn concepts"* — to make clear the profile is corrected and updated over time, not a fixed record.

## Notes

- All names, ages, and progress data are fictional placeholders; no contact information of any kind appears anywhere in the prototype.
- Voice input, Claude Vision report parsing, and persistent memory storage are simulated for this prototype — no real APIs are called.
