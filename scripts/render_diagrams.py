#!/usr/bin/env python3
"""
Converts the hand-drawn ASCII/box-drawing diagrams inside HumanOS notes into
clean inline SVG diagrams that use the site's theme colors.

Two patterns are handled:
  1. Linear chains (single path, e.g. "Subatomic Particles -> Atoms -> ... ")
     rendered as a vertical flow of connected boxes.
  2. The "Reality Connections" branching tree under each note's own heading
     is REGENERATED from that note's "Knowledge Relationships" section
     (Depends On / Enables / Related), which is more accurate structured
     data anyway, rather than trying to parse the ASCII tree itself.

Anything that doesn't confidently match one of these two safe patterns is
left untouched (original ASCII stays as-is) rather than risk mangling it.

Run this after copying updated notes from Obsidian into content/, and
before `npx quartz build`.
"""
import re
import sys
import glob
import html

CONTENT_DIR = "content"

BRANCH_CHARS = set("┌┬┐└┴┘├┼")
SUSPICIOUS_CHARS = set("↔↗↘↖↙●○═║╔╗╚╝▲")
CONNECTOR_CHARS = set("│▼┃↓▸➜·-—═ ")

FONT = "var(--bodyFont)"

def strip_wikilink(s):
    s = s.strip()
    m = re.match(r"^\[\[([^\]|]+)(\|([^\]]+))?\]\]$", s)
    if m:
        return (m.group(3) or m.group(1)).strip()
    return s.lstrip("-*• ").strip()

def parse_knowledge_relationships(text):
    m = re.search(r"^#\s*Knowledge Relationships\s*$(.*?)(?=^#\s|\Z)", text, re.M | re.S)
    if not m:
        return None
    section = m.group(1)
    buckets = {"in": [], "out": [], "related": []}
    for sub in re.finditer(r"^##\s*(.+?)\s*$(.*?)(?=^##\s|\Z)", section, re.M | re.S):
        name = sub.group(1).strip().lower()
        body = sub.group(2)
        links = [strip_wikilink(l) for l in re.findall(r"^\s*[-*]\s*(.+)$", body, re.M)]
        links = [l for l in links if l]
        if name in ("depends on", "built upon"):
            buckets["in"].extend(links)
        elif name in ("enables", "contains"):
            buckets["out"].extend(links)
        elif name == "related":
            buckets["related"].extend(links)
    if not (buckets["in"] or buckets["out"] or buckets["related"]):
        return None
    return buckets

def get_title(text, fallback):
    m = re.search(r"^#\s+(.+)$", text, re.M)
    if m:
        return m.group(1).strip()
    return fallback

def text_width(s, size=14.5):
    return max(len(s) * size * 0.56, 10)

def esc(s):
    return html.escape(s, quote=True)

def render_linear_svg(labels):
    box_w = min(max(text_width(l) + 40 for l in labels), 420)
    box_h = 40
    gap = 26
    pad = 16
    n = len(labels)
    total_h = pad * 2 + n * box_h + (n - 1) * gap
    total_w = box_w + pad * 2
    cx = total_w / 2

    parts = []
    parts.append(f'<svg width="100%" viewBox="0 0 {total_w:.0f} {total_h:.0f}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram">')
    parts.append(
        '<defs><marker id="hos-arrow" viewBox="0 0 10 10" refX="5" refY="5" '
        'markerWidth="5" markerHeight="5" orient="auto-start-reverse">'
        '<path d="M1 1L6 5L1 9" fill="none" stroke="var(--gray)" stroke-width="1.6" '
        'stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'
    )
    y = pad
    centers = []
    for i, label in enumerate(labels):
        cy = y + box_h / 2
        centers.append(cy)
        x = cx - box_w / 2
        accent = ' fill="var(--section-accent, var(--secondary))"' if i == 0 or i == n - 1 else ' fill="var(--light)"'
        text_fill = "var(--light)" if (i == 0 or i == n - 1) else "var(--darkgray)"
        parts.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{box_w:.1f}" height="{box_h}" rx="8" '
            f'{accent} stroke="var(--lightgray)" stroke-width="1"/>'
        )
        parts.append(
            f'<text x="{cx:.1f}" y="{cy + 5:.1f}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="14.5" fill="{text_fill}">{esc(label)}</text>'
        )
        y += box_h + gap

    for i in range(n - 1):
        y1 = centers[i] + box_h / 2
        y2 = centers[i + 1] - box_h / 2
        parts.append(
            f'<line x1="{cx:.1f}" y1="{y1:.1f}" x2="{cx:.1f}" y2="{y2 - 2:.1f}" '
            f'stroke="var(--gray)" stroke-width="1.6" marker-end="url(#hos-arrow)"/>'
        )
    parts.append("</svg>")
    return "".join(parts)

def render_relationship_svg(title, buckets):
    in_list = buckets["in"][:6]
    out_list = buckets["out"][:6]
    related = buckets["related"][:8]

    col_w = 190
    node_h = 34
    node_gap = 12
    center_w = min(max(text_width(title) + 44, 140), 240)
    pad = 20

    left_h = max(len(in_list), 1) * (node_h + node_gap) - node_gap
    right_h = max(len(out_list), 1) * (node_h + node_gap) - node_gap
    col_h = max(left_h, right_h, node_h)
    center_y = pad + col_h / 2

    related_row_y = pad + col_h + 46 if related else None
    total_h = pad + col_h + (70 if related else pad)
    total_w = pad + col_w + 70 + center_w + 70 + col_w + pad

    left_x = pad
    center_x = pad + col_w + 70
    right_x = center_x + center_w + 70

    parts = []
    parts.append(f'<svg width="100%" viewBox="0 0 {total_w:.0f} {total_h:.0f}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Relationship diagram for {esc(title)}">')
    parts.append(
        '<defs><marker id="hos-arrow2" viewBox="0 0 10 10" refX="5" refY="5" '
        'markerWidth="5" markerHeight="5" orient="auto-start-reverse">'
        '<path d="M1 1L6 5L1 9" fill="none" stroke="var(--gray)" stroke-width="1.6" '
        'stroke-linecap="round" stroke-linejoin="round"/></marker></defs>'
    )

    cy_center = center_y
    cx_center = center_x + center_w / 2
    parts.append(
        f'<rect x="{center_x:.1f}" y="{cy_center - node_h/2:.1f}" width="{center_w:.1f}" height="{node_h+10}" rx="9" '
        f'fill="var(--section-accent, var(--secondary))" stroke="var(--lightgray)" stroke-width="1"/>'
    )
    parts.append(
        f'<text x="{cx_center:.1f}" y="{cy_center + 5:.1f}" text-anchor="middle" '
        f'font-family="{FONT}" font-weight="600" font-size="14.5" fill="var(--light)">{esc(title)}</text>'
    )

    def draw_column(items, x, to_center, label_side):
        n = len(items)
        if n == 0:
            return
        col_h_local = n * (node_h + node_gap) - node_gap
        y0 = center_y - col_h_local / 2
        for i, item in enumerate(items):
            w = min(max(text_width(item) + 28, 90), col_w)
            bx = x if label_side == "left" else x + (col_w - w)
            by = y0 + i * (node_h + node_gap)
            ny = by + node_h / 2
            parts.append(
                f'<rect x="{bx:.1f}" y="{by:.1f}" width="{w:.1f}" height="{node_h}" rx="7" '
                f'fill="var(--light)" stroke="var(--lightgray)" stroke-width="1"/>'
            )
            parts.append(
                f'<text x="{bx + w/2:.1f}" y="{ny + 5:.1f}" text-anchor="middle" '
                f'font-family="{FONT}" font-size="13" fill="var(--darkgray)">{esc(item)}</text>'
            )
            if label_side == "left":
                lx1, lx2 = bx + w, cx_center - center_w/2
                marker_attr = 'marker-end="url(#hos-arrow2)"'
                lx2_final = lx2
            else:
                lx1, lx2 = cx_center + center_w/2, bx
                marker_attr = ""
                lx2_final = lx2 - 6
            parts.append(
                f'<line x1="{lx1:.1f}" y1="{ny:.1f}" x2="{lx2_final:.1f}" y2="{cy_center:.1f}" '
                f'stroke="var(--gray)" stroke-width="1.2" opacity="0.55" {marker_attr}/>'
            )

    draw_column(in_list, left_x, True, "left")
    draw_column(out_list, right_x, True, "right")

    if related:
        ry = related_row_y
        parts.append(
            f'<text x="{pad}" y="{ry - 20:.1f}" font-family="{FONT}" font-size="11.5" '
            f'fill="var(--gray)" letter-spacing="0.05em">RELATED</text>'
        )
        rx = pad
        for item in related:
            w = text_width(item) + 22
            if rx + w > total_w - pad:
                break
            parts.append(
                f'<rect x="{rx:.1f}" y="{ry - 14:.1f}" width="{w:.1f}" height="26" rx="13" '
                f'fill="none" stroke="var(--lightgray)" stroke-width="1"/>'
            )
            parts.append(
                f'<text x="{rx + w/2:.1f}" y="{ry + 4:.1f}" text-anchor="middle" '
                f'font-family="{FONT}" font-size="12" fill="var(--darkgray)">{esc(item)}</text>'
            )
            rx += w + 10
    parts.append("</svg>")
    return "".join(parts), total_w, total_h

def parse_linear_labels(block):
    lines = [l.rstrip() for l in block.split("\n")]
    labels = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if set(s) <= CONNECTOR_CHARS:
            continue
        labels.append(s)
    if len(labels) < 2:
        return None
    for l in labels:
        if any(c in SUSPICIOUS_CHARS for c in l):
            return None
        if "•" in l or len(l) > 60:
            return None
        if re.search(r"   ", l):
            return None
    return labels

def find_heading_above(text, pos):
    before = text[:pos]
    headings = list(re.finditer(r"^#{1,3}\s*(.+?)\s*$", before, re.M))
    if not headings:
        return ""
    return headings[-1].group(1)

def process_file(path):
    text = open(path, encoding="utf-8").read()
    original = text
    kr = parse_knowledge_relationships(text)
    title = get_title(text, path)

    stats = {"linear": 0, "branch": 0, "skip": 0}

    def repl(m):
        block = m.group(1)
        heading = find_heading_above(text, m.start())
        has_branch = any(c in block for c in BRANCH_CHARS)

        if has_branch:
            if "reality connections" in heading.lower() and kr:
                svg, w, h = render_relationship_svg(title, kr)
                stats["branch"] += 1
                return f'<div class="diagram-panel" style="max-width:{min(w,640):.0f}px">{svg}</div>'
            stats["skip"] += 1
            return m.group(0)

        if any(c in block for c in SUSPICIOUS_CHARS):
            stats["skip"] += 1
            return m.group(0)

        labels = parse_linear_labels(block)
        if labels is None:
            stats["skip"] += 1
            return m.group(0)

        svg = render_linear_svg(labels)
        stats["linear"] += 1
        width = min(max(text_width(max(labels, key=len)) + 40, 140), 420) + 32
        return f'<div class="diagram-panel diagram-panel-narrow" style="max-width:{width:.0f}px">{svg}</div>'

    new_text = re.sub(r"```text\n(.*?)```", repl, text, flags=re.S)

    if new_text != original:
        open(path, "w", encoding="utf-8").write(new_text)
    return stats

def main():
    files = glob.glob(f"{CONTENT_DIR}/**/*.md", recursive=True)
    total = {"linear": 0, "branch": 0, "skip": 0}
    changed_files = 0
    for f in files:
        stats = process_file(f)
        if stats["linear"] or stats["branch"]:
            changed_files += 1
        for k in total:
            total[k] += stats[k]
    print(f"Files scanned: {len(files)}")
    print(f"Files changed: {changed_files}")
    print(f"Linear chains converted: {total['linear']}")
    print(f"Relationship diagrams regenerated: {total['branch']}")
    print(f"Left as original ASCII (skipped): {total['skip']}")

if __name__ == "__main__":
    main()
