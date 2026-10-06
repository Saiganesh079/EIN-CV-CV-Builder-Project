# EIN-CV

A lightweight, local-first CV builder for creating, editing, saving, and exporting professional resumes directly in the browser.

EIN-CV is designed around a clean, low-clutter workflow: edit your CV from a structured content panel, preview it live on an A4/Letter page, customize the visual design, and export the finished document as PDF or DOCX.

> **No backend required. No account required. No build step required.**

## ✨ Features

### CV Editor
- Live CV preview
- Editable personal/header information
- Professional Summary
- Experience
- Education
- Projects
- Skills
- Languages
- Certifications
- Custom sections
- Add, remove, duplicate, move, collapse, and drag/reorder sections
- Multiple entries inside supported sections
- Project-specific fields including optional project links
- Clickable email, phone, Portfolio, and LinkedIn links

### Design
- A4 and Letter page sizes
- Multiple CV templates:
  - Classic
  - Modern
  - Minimal
  - Compact
  - Creative
- Font selection
- Accent color
- Text color
- Font-size control
- Page-margin control
- Compact spacing mode
- Contact-icon toggle
- Live zoom control
- EIN-CV visual system using:
  - EIN Blue: `#447CE8`
  - EIN Charcoal: `#2B2B2B`

### Saving & Backup
- Automatic browser autosave
- Manual Save button
- Data persists after closing and reopening the app
- Undo / Redo
- JSON Export
- JSON Import
- Backward-compatible reading of the older local CV storage key

> Browser storage is local to the current browser profile. Use **JSON Export** when moving the CV to another computer or browser.

### Export
- **PDF** through the browser's print engine
- **DOCX** editable Microsoft Word document
- Portfolio and LinkedIn hyperlinks are preserved in the DOCX export

### Accessibility & UX
- Keyboard focus states
- Reduced-motion support
- Responsive layout
- Mobile editor panel
- Keyboard shortcuts
- Minimal visual clutter
- No external runtime dependencies

## 🚀 Getting Started

### Option 1 — Download ZIP

Download the latest EIN-CV ZIP, extract it, and open:

```text
index.html
```

in a modern browser.

### Option 2 — Clone with Git

```bash
git clone https://github.com/YOUR_USERNAME/ein-cv.git
cd ein-cv
```

Then open `index.html`.

No:

- `npm install`
- Node.js server
- database
- environment variables
- API keys

are required.

## 🖥️ Browser Support

EIN-CV is intended for modern browsers with support for:

- ES6+ JavaScript
- `localStorage`
- `Blob`
- `FileReader`
- `TextEncoder`
- CSS Grid / Flexbox

Recommended:

- Google Chrome
- Microsoft Edge
- Firefox
- Safari

## 📁 Project Structure

```text
ein-cv/
├── index.html       # Main application UI
├── styles.css       # Application + CV styles
├── app.js           # Editor logic, storage, export and interactions
├── ein-logo.png     # EIN-CV logo
└── README.md
```

## 🧩 Architecture

EIN-CV is intentionally simple:

```text
HTML
  ↓
Interface / Editor
  ↓
JavaScript state
  ↓
localStorage
  ↓
Live CV renderer
  ├── PDF / Print
  ├── DOCX
  └── JSON Backup
```

The application keeps CV data in a JavaScript object and renders the editable sidebar and CV preview from the same state.

## 💾 Local Storage

The current primary storage key is:

```text
ein-cv:data:v1
```

EIN-CV also reads the older:

```text
cvbuilder-data
```

key for compatibility with earlier versions.

Because storage is browser-local:

- Clearing browser storage can remove saved CV data.
- Incognito/private browsing may not persist data.
- Another computer will not automatically have the same CV.

For portability, use:

**Export → EIN-CV JSON**

and then:

**Import → select the JSON backup**

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl + Y` | Redo |
| `Esc` | Close section dialog |

## 📄 Exporting a PDF

1. Finish editing the CV.
2. Select **A4** or **Letter**.
3. Click **Download PDF**.
4. In the browser print dialog, choose **Save as PDF**.
5. Verify the selected paper size and margins.

## 📝 Exporting DOCX

Click:

```text
DOCX
```

EIN-CV generates an editable Word document containing the CV content and supported hyperlinks.

The DOCX export is intended for editing in Microsoft Word and other compatible office applications.

## 🔗 Hyperlinks

Portfolio and LinkedIn are displayed as short labels in the CV:

```text
Portfolio · LinkedIn
```

while the underlying full URLs remain clickable.

Example:

```text
https://example.com
https://linkedin.com/in/example
```

can appear visually as:

```text
Portfolio
LinkedIn
```

## 🎨 EIN-CV Design

The application uses the supplied EIN-CV visual identity as its primary interface language.

### Primary colors

| Color | Hex |
|---|---|
| EIN Blue | `#447CE8` |
| EIN Charcoal | `#2B2B2B` |
| Soft Blue | `#EDF3FF` |

The interface intentionally uses restrained surfaces, clear focus states, and limited decorative elements to keep the editor fast and readable.

## 🔒 Privacy

EIN-CV is local-first.

Your CV content is stored in your browser's local storage by default. The application does not require an EIN-CV cloud account or backend service to edit and save a CV.

When exporting a CV:

- PDF is generated through the browser print flow.
- DOCX is generated locally in the browser.
- JSON backup is downloaded to your device.

## 🛠️ Development

There is no build system in the current version.

For development:

```bash
git clone https://github.com/YOUR_USERNAME/ein-cv.git
cd ein-cv
```

Edit:

```text
index.html
styles.css
app.js
```

Then refresh the browser.

## ✅ Validation

The production package includes:

- HTML interface
- CSS theme
- JavaScript editor
- Local persistence
- JSON import/export
- PDF print export
- DOCX export
- EIN-CV logo asset

The JavaScript file is syntax-checked before release and the distribution ZIP is verified for integrity.

## 🗺️ Roadmap

Possible future improvements:

- Inline editing directly on the CV page
- More CV templates
- Multiple saved CV profiles
- Template duplication
- Section visibility toggles
- Photo/profile image support
- Drag-and-drop item ordering inside sections
- More advanced DOCX styling
- Optional cloud synchronization
- Import from existing CV files
- ATS-focused CV checks
- Custom reusable design presets

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/my-feature
```

3. Make your changes.
4. Test the editor in a modern browser.
5. Commit:

```bash
git commit -m "Add my feature"
```

6. Push the branch:

```bash
git push origin feature/my-feature
```

7. Open a Pull Request.

Please keep the application dependency-light and preserve the local-first workflow.

## 📜 License

Choose and add a license that matches how you want EIN-CV to be used.

For example:

```text
MIT License
```

If you use the MIT License, add a `LICENSE` file containing the official MIT license text.

---

## EIN-CV

**Edit once. Save locally. Export anywhere.**

Built with:

```text
HTML · CSS · JavaScript
```
