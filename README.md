# ASR Design Space — website

Hand-coded rebuild of asrdesignspace.com (HTML, CSS, vanilla JS, no build step).

## Structure

```
index.html              Homepage
contact/index.html      Contact page (intro, email, contact form)
about/index.html        About page (css/about-page.css); resume in assets/resume/
termsofuse/index.html   Terms of Use (css/legal.css)
privacypolicy/index.html Privacy Policy (css/legal.css)
projects/index.html     All Projects page: gallery, category filters, search (css/projects-page.css, js/projects-filter.js)
projects/zay-couture/   Zay Couture case study (uses css/case-study.css)
projects/perfect-designs/  Perfect Designs case study (case-study.css + case-study-perfect-designs.css)
projects/masjidurrahman/   Masjid Ur-Rahman case study (case-study.css + case-study-masjid-ur-rahman.css)
projects/qehs-vault/       QEHS Vault case study (case-study.css + case-study-qehs-vault.css)
css/variables.css       Brand tokens (colours, font, spacing) + Nunito @font-face
css/base.css            Reset, shared helpers, buttons
css/header.css          Navigation (desktop + mobile menu)
css/hero.css            Hero section
js/nav.js               Mobile menu toggle
js/typewriter.js        Hero typewriter animation
js/slider.js            Services card slider
js/footer.js            Keeps the footer copyright year current
js/contact-form.js      Contact form: validation and sending
css/contact.css         Contact page styles
css/case-study.css      Case-study template; brand colours/fonts set per project (.cs--zay, .cs--pd)
css/case-study-perfect-designs.css  Perfect Designs-specific sections (timeline, challenges, design system)
css/case-study-masjid-ur-rahman.css Masjid Ur-Rahman-specific sections (hero, timeline, design process)
assets/fonts/           Nunito (self-hosted, SIL Open Font License)
assets/images/          logo.svg, hero-image.png (+ WebP versions)
```

## Preview locally

Open a terminal in this folder and run `python3 -m http.server`, then visit http://localhost:8000.
(Opening index.html by double-clicking works too, but browsers block the self-hosted font on `file://`, so text falls back to a system font.)

## Editing the typewriter phrases

In `index.html`, change `data-phrases="UI/UX Design|Front-end Developments|Backend Solutions"`
(phrases separated by `|`) and the matching screen-reader sentence just above it.
Speeds are in the `TIMING` object at the top of `js/typewriter.js`.

## Deploying

Upload the whole folder (keep the structure) to your host or GitHub Pages; `index.html` is the entry point.

## Contact form (Formspree)

The Contact page form (`contact/index.html`) sends messages through **Formspree**, a form
service that works on static hosting such as GitHub Pages. The endpoint is set in the form's
`action` attribute: `https://formspree.io/f/xgaaalaa`. Formspree form IDs are meant to be
public, so nothing secret lives in this code.

`js/contact-form.js` checks the fields, sends the form in the background with `fetch()`,
blocks repeat clicks while sending, and shows a success or error message under the button.
Without JavaScript, the browser's own validation runs and the form posts straight to Formspree.

Fields sent: `name`, `email` (Formspree uses it as the Reply-To address), `subject`, `message`,
plus `_subject` (the subject line of the email you receive) and `_gotcha` (a hidden spam trap).

To test: on the published site, open the Contact page, send a message, and check that it arrives
at hello@asrdesignspace.com and appears under the form in the Formspree dashboard.

## Adding or updating a project on the All Projects page

Open `projects/index.html` and find the `<ul class="work-grid">` list. Each project is one
`<li class="work-card">` block. To add one, copy a block and change:

- `data-categories`: one or more of `ui-ux web-development branding e-commerce ai-automation
  mobile-app graphics-design`, separated by spaces. The filter buttons use these.
- `data-keywords`: extra words people might search for (tools, industry, client type).
- the image (`src`, `srcset`, `alt`, `width`, `height`), and `--cover-pos` to choose which part
  of the image stays visible in the 16:9 thumbnail.
- the link `href` (its case-study folder, e.g. `my-project/index.html`) and the hidden link label.
- the badges, title and description.

Search looks at the title, description, badges, categories and keywords. No JavaScript changes
are needed. Remember to update the homepage card too if the project is also featured there.
