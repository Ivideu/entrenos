# Fútbol sala Infantil · Web de entrenamientos

Dos partes separadas:

| Carpeta | Para quién | ¿Se publica? |
|---|---|---|
| `docs/` | Jugadores (ficha + pizarras animadas) | **Sí** (GitHub Pages o Netlify) |
| `mister/` | Tú (generador y sesión de entrenador) | **No**: ábrela solo en tu ordenador |

## Publicar la web de los jugadores

**Netlify (lo más rápido):** entra en app.netlify.com/drop y arrastra la carpeta `docs`. Te da una URL para pasar al equipo.

**GitHub Pages:** sube el proyecto a un repo → Settings → Pages → Branch `main`, carpeta `/docs`.

> Sube solo `docs/`. Si usas GitHub, añade `mister/` al `.gitignore` o guárdala fuera del repo.

## Uso semanal

1. Abre `mister/index.html` (doble clic, funciona sin internet).
2. Escribe lo que has visto. Se marcan solos los diagnósticos que encajan.
3. Pulsa **Generar entrenamiento**: ves tu sesión (4 bloques con reglas + preguntas socráticas) y la vista del jugador.
4. Pestaña **Publicar** → carga tu `docs/sessions.json` actual → descarga el actualizado → sustitúyelo en `docs/` y vuelve a publicar.
5. Los jugadores abren la URL y ven la ficha más reciente; las anteriores quedan en "Entrenamientos anteriores".

## Diagnósticos incluidos

- Se mueven en bloque / no abren campo
- Se quedan parados esperando el balón
- No crean espacios (no arrastran marcas)
- Lentitud de lectura (cabeza abajo)

Se pueden combinar: la primera casilla marcada es el foco y las demás añaden reglas extra y escenas.

## Ideas que no encajan en esos cuatro

Cuéntaselas a Claude en el chat. Te devolverá un JSON de sesión con escenas nuevas; pégalo en la sección **Importar** del panel. Mira `mister/ejemplo-sesion-completa.json` para ver el formato. Cada idea nueva puede añadirse también a `mister/library.js` y la biblioteca crece contigo.

## Privacidad

`sessions.json` solo contiene la parte del jugador. Tu sesión de entrenador y tu historial viven en tu navegador (localStorage) y no se publican.
