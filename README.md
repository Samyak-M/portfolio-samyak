# Portfolio — Samyak Mukherjee

A lightweight, single-page portfolio built with vanilla HTML, CSS, and JavaScript. All content is driven by `resume.json` (following the [JSON Resume](https://jsonresume.org/schema/) schema), so you can update your details in one place without touching the layout code.

## Project Structure

```
.
├── index.html      # Page structure, semantic landmarks, left-side nav
├── styles.css      # Styles: layout, nav, responsive breakpoints, dark-mode
├── app.js          # Renders resume.json into the DOM; scroll spy; mobile nav toggle
└── resume.json     # All personal/professional content (JSON Resume schema)
```

## Features

- **Left-side sticky navigation** (desktop) that collapses into a hamburger menu on mobile.
- **Active section highlight** via IntersectionObserver — the nav item for the section in view is highlighted automatically.
- **Smooth scrolling** for all in-page anchor links.
- **Semantic HTML**: `header`, `nav`, `main`, `section`, `article`, `footer` with proper heading hierarchy (single `<h1>`, `<h2>` per section, `<h3>` per entry).
- **ATS / AI / bot-friendly**: clean text content with no JS-gating of important information; structured data in JSON Resume format.
- **Accessible**: skip link, `aria-current` on the active nav item, visible focus styles, keyboard-navigable controls.
- **Dark mode**: automatic via `prefers-color-scheme`.

## Customising Content

Edit `resume.json` to update any section. The sections rendered by the app are:

| Section key in JSON | Nav label | Notes |
|---|---|---|
| `basics.summary` or `resume.summary` | About Me | Recruiter-friendly intro paragraph |
| `work` | Experience | Array of job objects |
| `education` | Education | Array of education objects |
| `skills` | Skills | Array of skill groups with keywords |
| `projects` | Projects | Array of project objects |
| `certificates` | Certificates | Array of certificate objects |
| `awards` | Awards | Array of award objects |
| `basics.email` | Contact | Enables the contact section and email button |

Sections with no data are automatically hidden, and the corresponding nav item is removed from the sidebar.

## Adding a Downloadable Resume

To add a PDF download link, place your resume PDF in the project root (e.g. `resume.pdf`) and add the following entry to `resume.json` under `basics`:

```json
"resumeUrl": "resume.pdf"
```

Then in `app.js`, read `basics.resumeUrl` and render a download button in the hero or a dedicated section.

## Running Locally

Open `index.html` directly in a browser **via a local server** (required so `fetch('resume.json')` works):

```bash
# Python 3
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then visit `http://localhost:8080`.
