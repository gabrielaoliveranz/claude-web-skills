# CSS traps
- Add `[hidden] { display: none !important; }`. Without it, any element with a `display` rule ignores `hidden`.
- Elements hidden with `opacity: 0` still take space and move the layout. Use `display: none` for anything that shouldn't take space.
- Big gradient text (`background-clip: text`) clips glyph edges. Add padding plus an equal negative margin.
