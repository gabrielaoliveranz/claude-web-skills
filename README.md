# Skills web para Claude

Dos skills para que Claude arme sitios y apps web chicas sin repetir los errores de siempre. Salen de lanzar tres productos reales (un sitio de consultoría, una app de presupuesto instalable y una app paga con su web de venta) a lo largo de unos 250 commits. Cada regla es un error que pasó de verdad.

[![Capturas que genera check-pages.mjs a 390, 820 y 1440 px](docs/check-pages.png)](docs/check-pages.png)

*Capturas de `check-pages.mjs` en celular, tablet y compu. Además de sacarlas, el script avisa si algo se desborda, se corta en el borde o si el header se baja de renglón.*

## Qué incluye

| Skill | Para qué sirve |
|---|---|
| [`web-launch-checklist`](web-launch-checklist/SKILL.md) | La parte técnica: versiones de apps instalables (PWA), problemas de iPhone y Android, seguridad (CSP), mudanza de dominio, pagos con Paddle y similares, chequeos automáticos, sitios en varios idiomas y trampas de CSS. Incluye dos scripts. |
| [`web-design-playbook`](web-design-playbook/SKILL.md) | El diseño: identidad con tokens, qué mostrar en cada pantalla del celular, header y navegación, ideas para el hero y las secciones, tarjetas y carruseles, animaciones, accesibilidad y la revisión antes de entregar. Incluye una plantilla de `DESIGN.md`. |

Funcionan solas o juntas. Si están las dos, la de diseño usa el script de chequeo de la otra.

## Instalación

### Claude Code

macOS o Linux:
```
git clone https://github.com/gabrielaoliveranz/claude-web-skills.git
cp -r claude-web-skills/web-launch-checklist claude-web-skills/web-design-playbook ~/.claude/skills/
```

Windows (PowerShell):
```
git clone https://github.com/gabrielaoliveranz/claude-web-skills.git
Copy-Item -Recurse claude-web-skills\web-launch-checklist, claude-web-skills\web-design-playbook $HOME\.claude\skills\
```

Para un solo proyecto, copialas en `.claude/skills/` dentro del proyecto.

### claude.ai y la app de escritorio

1. Tocá **Code › Download ZIP** en esta página y descomprimí.
2. Comprimí cada carpeta de skill por separado (`web-launch-checklist.zip` y `web-design-playbook.zip`).
3. En **Settings › Capabilities**, activá la ejecución de código y subí cada ZIP en **Skills**.

### Para los scripts (opcional)

Necesitás Node 18 o más y Playwright:
```
npm install playwright
npx playwright install chromium
```

Las skills funcionan igual sin los scripts. En ese caso Claude revisa con capturas propias o te pide que mires en el celular.

## Cómo se usa

No hace falta llamarlas: Claude las carga solo cuando la tarea coincide. Ejemplos:

- *"Armame una landing para mi app de turnos, en español e inglés, con precios por país."*
- *"Subí la versión de la app y fijate que el celular se actualice."*
- *"Conectá Paddle en modo prueba y verificá que el pago desbloquee la app."*
- *"Revisá la web en celular, tablet y compu antes de publicar."*
- *"Rediseñá la portada: en el celular hay demasiadas cosas en la primera pantalla."*

El script de chequeo también se puede correr a mano:
```
node web-launch-checklist/scripts/check-pages.mjs --base http://localhost:8000 --pages index.html,precios.html --langs es,pt-PT --out capturas
```

| Opción | Qué hace | Por defecto |
|---|---|---|
| `--base` | Dirección del sitio (un servidor local) | `http://localhost:8000` |
| `--pages` | Páginas a revisar, separadas por coma | `index.html` |
| `--langs` | Idiomas a probar (se agregan como `?lang=`) | ninguno |
| `--widths` | Anchos en píxeles | `320,390,820,1440` |
| `--header` | Selector del header | `header, .nav` |
| `--out` | Carpeta de capturas | `shots` |

## Qué hay adentro

```
web-launch-checklist/
├── SKILL.md                  qué leer según la tarea
├── references/               una regla por tema (PWA, celulares, dominios, pagos, idiomas, CSS...)
└── scripts/
    ├── check-pages.mjs       capturas + desbordes + cortes + header en varios renglones
    └── bump-version.mjs      sube la versión de una PWA en todos los lugares a la vez
web-design-playbook/
├── SKILL.md                  qué leer según la tarea
├── references/               identidad, pantalla del celular, header, patrones, carruseles, animación, revisión
└── assets/DESIGN-template.md plantilla para definir la identidad de un producto nuevo
docs/                         imagen de este README
```

## Cómo funciona por dentro

- **Carga por partes:** cada `SKILL.md` es corto y tiene una tabla que dice qué archivo de `references/` leer según la tarea. Claude no carga todo de golpe, solo lo que necesita.
- **Basado en errores reales:** cada regla es un problema que se resolvió en producción. Por ejemplo, que el teclado de Android tapaba los botones, que una regla de seguridad bloqueaba en silencio la consulta del pago, o que en el iPhone cada ícono de la pantalla de inicio tiene su propio almacenamiento.
- **Chequeo con capturas:** `check-pages.mjs` recorre cada página (con scroll, para activar las animaciones), ignora a propósito los carruseles y marquesinas que se desbordan por diseño, y avisa lo que queda cortado en un borde.

## Créditos

Hecho por [Gabriela Olivera](https://gabrielaolivera.nz) junto a Claude. El formato del repo está inspirado en [explainer-skill](https://github.com/alandaitch/explainer-skill).

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

## English

Two Claude skills for building small web products without repeating common mistakes, drawn from shipping three real products over about 250 commits.

- **`web-launch-checklist`:** PWA releases, iPhone and Android quirks, CSP, domain moves, payments with a merchant of record (Paddle and similar), automated checks for static sites, multilingual sites and CSS traps. It ships `check-pages.mjs`, which screenshots every page at 320/390/820/1440 px and flags overflow, clipped elements and wrapped headers, and `bump-version.mjs`.
- **`web-design-playbook`:** identity tokens, what to show per phone screen, header and navigation, hero and section patterns, cards and carousels, motion, accessibility and a pre-handover review. It ships a `DESIGN.md` template.

**Install in Claude Code:**
```
git clone https://github.com/gabrielaoliveranz/claude-web-skills.git
cp -r claude-web-skills/web-launch-checklist claude-web-skills/web-design-playbook ~/.claude/skills/
```

**claude.ai:** download the ZIP, zip each skill folder on its own, turn on code execution in Settings › Capabilities, and upload each one under Skills.

**Scripts (optional):** Node 18+ and `npm install playwright && npx playwright install chromium`.

Licence: MIT.
