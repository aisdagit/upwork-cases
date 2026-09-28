# NoteStruct (Prototype)

A one-page tool that turns rough, unstructured notes into a Title, Summary, Key Points and Next Steps. Pure HTML/CSS/JS, no backend, no build step — the "AI" response is simulated with a heuristic text structurer that never invents facts not present in the input.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
cd notestruct
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Demo flow

1. Paste rough notes into the textarea (or type freely). The **Generate** button enables once there's text.
2. Click **Generate** → a brief loading state with skeleton placeholders, then a structured result appears: Title, Summary, Key Points, Next Steps.
3. Click **Copy** to copy the structured result as plain text (button shows "Copied" briefly).
4. Edit the notes after a result exists → the button becomes **Generate Again**.
5. Occasionally (and always if the notes contain the phrase "force error", useful for demos) generation fails — the input is preserved and an inline error appears with **Try Again** / **Edit Text** actions.

## Behavior notes

- The structuring logic is a local heuristic (title from the first sentence/heading line, summary from the leading sentences, key points from bullet lines or standalone sentences, next steps from action-indicating phrasing). It never fabricates people, dates or requirements — if no next steps can be derived from the text, it says so explicitly instead of inventing them.
- No login, storage, history, payments or file uploads — everything lives in the current page state.
