# Multilingual apps: how to build translations that don't break

## Structure
- **One source language in the code,** every visible string through one function (for example `L("text")`).
- **Full dictionaries for the main languages,** and regional variants that store only their differences (es-419 and es-ES on top of es-AR; en-US on top of en-GB; pt-PT on top of pt-BR).
- **Add every new string to every language in the same change.**
- **The app follows the device language,** or the country's language, until the person picks one. Store "picked by the person" separately so an automatic choice never overrides theirs.
- **Language and currency are separate settings.**
- **`?lang=` in links** opens the app in that language. Keep it on internal links.

## Traps we hit
- **A single dictionary word translates everywhere.** "Saved" became "Ahorrado" in a "saved successfully" message. Use distinct keys ("Amount saved").
- **Composed strings** ("$6 over", "{name} marked as paid") need patterns. Put the most specific pattern first.
- **Keep numbers and names in their own elements,** so the fixed text matches the dictionary.
- **Regional grammar:** Rioplatense "vos" forms leak into neutral Spanish; check every variant after a change. In Spanish, "u" replaces "o" only before words starting with o/ho ("clínica o mutua").
- **The longest language** (often Portuguese or German) breaks headers and buttons first. Test it.
- **Legal text:** translate after the base version is reviewed. Until then, show the base text with a "translation in progress" note.

## Money, dates and places
- **Currency symbol rules:** a dollar in its own country shows as "$", elsewhere with a prefix (US$, NZ$, A$). Some currencies use no decimals (for example CLP, COP, JPY).
- **Accept both "6.10" and "6,10" when reading amounts.** Show round amounts without decimals.
- **Date order by country:** mm/dd/yyyy for the US and Puerto Rico, dd/mm/yyyy elsewhere, in exports too.
- **Public holidays:**
  - **Names:** show them in the country's own language.
  - **Offline:** calculate fixed and moving holidays in the app, so it works without a connection.
  - **Online:** fetch an official source monthly, sending only the country code.
  - **Decreed holidays:** one-off holidays declared during the year can't be calculated, so plan a hosted file you update.
- **Demo data matches the language** (country, currency, holidays, names). Use international names that work in every language.
- **Phone links for messaging apps:** add the country dialling code when the number doesn't start with + or 00.
