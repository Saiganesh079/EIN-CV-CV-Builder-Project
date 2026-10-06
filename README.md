# EIN-CV

EIN-CV is a local-first CV builder built with plain HTML, CSS and JavaScript.

## Run
Open `index.html` in a modern browser. No server, account, npm install, database, or internet connection is required.

## Included
- EIN-CV logo asset based on the supplied logo
- EIN blue / charcoal visual system (#447CE8 / #2B2B2B)
- Accessible, low-clutter editor
- Personal/header details
- Professional Summary, Experience, Education, Projects, Skills, Languages, Certifications and Custom sections
- Add, remove, duplicate, move up/down and drag/reorder sections
- Live preview
- A4 / Letter sizing
- Templates, fonts, colors, font size, margins and compact mode
- Portfolio and LinkedIn displayed as short labels with clickable hyperlinks
- Email and phone links
- Autosave to browser storage + explicit Save
- Backward-compatible restore of earlier EIN-CV/local CV data
- JSON export/import backup
- Undo / redo
- PDF export through browser print
- Editable DOCX export with hyperlinks
- Keyboard shortcuts: Save, Undo, Redo
- Responsive mobile editor panel
- Reduced-motion and focus-state support

## Storage
The primary storage key is `ein-cv:data:v1`. An older `cvbuilder-data` key is also read for compatibility.

Browser storage is local to the current browser profile. Use JSON Export for portable backups.
