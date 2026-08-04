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
      </div>
    </header>
  )
}

export default (() => Header) satisfies QuartzComponentConstructor
