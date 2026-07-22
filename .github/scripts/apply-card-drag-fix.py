from pathlib import Path

path = Path('virtual-cards.js')
text = path.read_text()

def replace_once(old, new):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'virtual-cards.js: expected one match, found {count}')
    text = text.replace(old, new, 1)

replace_once(
    "      const ghost = element.cloneNode(true);\n      ghost.classList.add('virtual-drag-ghost');\n      if (extraClass) ghost.classList.add(extraClass);",
    "      const ghost = element.cloneNode(true);\n      ghost.classList.remove('selected', 'is-drag-source', 'is-flight-source', 'is-draw-target', 'card-enter');\n      ghost.classList.add('virtual-drag-ghost');\n      ghost.removeAttribute('aria-pressed');\n      if (extraClass) ghost.classList.add(extraClass);"
)

replace_once(
    "    const returnDragGhost = async current => {",
    "    const dropState = current => {\n      if (!current?.ghost || !current?.rect) return { valid: false, armed: false };\n      const distance = Math.hypot(current.dx, current.dy);\n      const focusRect = refs.focus.getBoundingClientRect();\n      const ghostRect = current.ghost.getBoundingClientRect();\n      const centerX = ghostRect.left + ghostRect.width / 2;\n      const centerY = ghostRect.top + ghostRect.height / 2;\n      const centerInside = centerX >= focusRect.left - 8 && centerX <= focusRect.right + 8\n        && centerY >= focusRect.top - 8 && centerY <= focusRect.bottom + 8;\n      const thrownUp = current.dy < -112 && Math.abs(current.dy) > Math.abs(current.dx) * .82;\n      const armed = distance >= 76 && (centerInside || thrownUp);\n      return { valid: armed, armed };\n    };\n\n    const returnDragGhost = async current => {"
)

replace_once(
    "      const action = state.phase === 'exchange' ? 'exchange' : state.phase === 'play' ? 'play' : '';\n      const focusRect = refs.focus.getBoundingClientRect();\n      const ghostRect = current.ghost.getBoundingClientRect();\n      const overlaps = ghostRect.right > focusRect.left && ghostRect.left < focusRect.right\n        && ghostRect.bottom > focusRect.top && ghostRect.top < focusRect.bottom;\n      const thrownUp = current.dy < -58 && Math.abs(current.dy) > Math.abs(current.dx) * .55;\n      const valid = !cancelled && action && (overlaps || thrownUp);",
    "      const action = state.phase === 'exchange' ? 'exchange' : state.phase === 'play' ? 'play' : '';\n      const valid = !cancelled && action && dropState(current).valid;"
)

replace_once(
    "        if (!pointer.dragging && Math.hypot(pointer.dx, pointer.dy) >= 9) {",
    "        if (!pointer.dragging && Math.hypot(pointer.dx, pointer.dy) >= 15) {"
)

replace_once(
    "          const focusRect = refs.focus.getBoundingClientRect();\n          const ghostRect = pointer.ghost.getBoundingClientRect();\n          const overlaps = ghostRect.right > focusRect.left && ghostRect.left < focusRect.right\n            && ghostRect.bottom > focusRect.top && ghostRect.top < focusRect.bottom;\n          const armed = overlaps || (pointer.dy < -58 && Math.abs(pointer.dy) > Math.abs(pointer.dx) * .55);",
    "          const armed = dropState(pointer).armed;"
)

path.write_text(text)
