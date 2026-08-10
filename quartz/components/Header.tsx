import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// The 12 HumanOS domains. They live behind a collapsed "Explorer" toggle
// next to the logo — clicking it opens them as a horizontal row beneath
// the navbar, clicking again collapses it back down.
const domains: { label: string; slug: string }[] = [
  { label: "Foundations", slug: "01-foundations" },
  { label: "Universe", slug: "02-universe" },
  { label: "Natural Sci.", slug: "03-natural-sciences" },
  { label: "Life Sci.", slug: "04-life-sciences" },
  { label: "Human", slug: "05-human" },
  { label: "Health", slug: "06-health--and--medicine" },
  { label: "Mind", slug: "07-mind" },
  { label: "Society", slug: "08-society--and--civilisation" },
  { label: "Tech", slug: "09-technology--and--engineering" },
  { label: "Philosophy", slug: "10-philosophy--and--spirituality" },
  { label: "Living", slug: "11-living-well-(the-human-operating-system)" },
  { label: "HumanOS", slug: "12-humanos" },
]


const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  if (children.length === 0) return null
  const [logo, ...utilities] = children
  return (
    <header>
      {logo}
      <button
        type="button"
        class="domain-toggle"
        aria-expanded="false"
        aria-controls="domain-nav-panel"
      >
        <span>Explorer</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <line x1="6" y1="1" x2="6" y2="11" />
          <line x1="1" y1="6" x2="11" y2="6" />
        </svg>
      </button>
      <nav class="domain-nav" id="domain-nav-panel" aria-label="Domains">
        {domains.map((d) => (
          <a href={`/${d.slug}`}>{d.label}</a>
        ))}
      </nav>
      <div class="header-utilities">
        {utilities}
        {/* The graph plugin renders its own real, already-wired
            .global-graph-icon button down in the (visually hidden) sidebar
            preview. Rather than faking a lookalike button here and proxying
            clicks to it — which turned out to be unreliable — the header
            script physically moves that real button into this slot on every
            page load/navigation, so what the user clicks IS the button the
            plugin's own code is listening on. See DefaultFrame.tsx. */}
        <span class="graph-view-trigger-slot" aria-hidden="false"></span>
        <button
          type="button"
          class="feedback-trigger"
          data-tooltip="Feedback"
          aria-haspopup="dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
      {/* Feedback modal — a fixed-position descendant of <header>. This is
          deliberate: .header-utilities' other fixed-position overlays
          (search, global graph) already rely on <header> never getting a
          filter/backdrop-filter/transform (that would create a new
          containing block and break their fixed positioning) — see the
          note above .page-header header in custom.scss. Same guarantee
          covers this modal, so it's safe to nest here too. */}
      <div
        class="feedback-modal-backdrop"
        id="feedback-modal-backdrop"
        aria-hidden="true"
      >
        <div
          class="feedback-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <button type="button" class="feedback-modal-close" aria-label="Close">
            &times;
          </button>
          <h2 id="feedback-modal-title">Help improve HumanOS</h2>
          <form class="feedback-form" id="feedback-form">
            <p class="feedback-form-label">What would you like to tell us?</p>
            <div class="feedback-radio-group">
              <label class="feedback-radio">
                <input type="radio" name="feedback-category" value="error" />
                <span>Report an error</span>
              </label>
              <label class="feedback-radio">
                <input type="radio" name="feedback-category" value="improvement" />
                <span>Suggest an improvement</span>
              </label>
              <label class="feedback-radio">
                <input type="radio" name="feedback-category" value="topic" />
                <span>Suggest a topic</span>
              </label>
              <label class="feedback-radio">
                <input type="radio" name="feedback-category" value="unclear" />
                <span>Something is unclear</span>
              </label>
              <label class="feedback-radio">
                <input type="radio" name="feedback-category" value="general" />
                <span>General feedback</span>
              </label>
            </div>
            <label class="feedback-field-label" for="feedback-message">
              Message
            </label>
            <textarea
              class="feedback-textarea"
              id="feedback-message"
              name="message"
              rows={4}
              required
            ></textarea>
            <label class="feedback-field-label" for="feedback-email">
              Email (optional)
            </label>
            <input
              class="feedback-input"
              id="feedback-email"
              type="email"
              name="email"
              placeholder="you@example.com"
            />
            {/* Honeypot — hidden from real visitors via CSS, off-screen
                and unreachable by tab. Bots that auto-fill every field
                trip it; the worker silently accepts and drops those. */}
            <input
              class="feedback-honeypot"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <button type="submit" class="feedback-submit">
              Submit Feedback
            </button>
            <p class="feedback-status" id="feedback-status" role="status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </header>
  )
}

export default (() => Header) satisfies QuartzComponentConstructor
