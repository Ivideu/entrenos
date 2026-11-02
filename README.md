# Fútbol sala Infantil · Web de entrenamientos con IA

## Qué hace

1. Tú subes un **dibujo** (foto de una pizarra) o un **vídeo** corto en tu panel privado, o escribes una frase.
2. La IA lo interpreta y te prepara: tu **sesión de entrenamiento** (4 bloques + preguntas socráticas) y la **ficha para los jugadores** (con los fotogramas, preguntas para debatir y pizarras animadas).
3. Pulsas **Publicar** y los jugadores lo ven en su web.

| Carpeta | Para quién | ¿Se publica? |
|---|---|---|
| `docs/` | Jugadores | **Sí** (es lo que sirve Netlify) |
| `mister/` | Tú | **No**: se abre con doble clic en tu ordenador |
| `netlify/functions/` | La IA (backend) | Sí, pero protegido con tu contraseña |

## Puesta en marcha (una sola vez, ~10 min)

### 1. Clave de Gemini
Entra en aistudio.google.com/apikey con tu cuenta de Google y crea una clave (*Create API key*). Hay un nivel gratuito con límites; revisa en Google AI Studio qué límites tiene tu cuenta y, si quieres más, activa la facturación y pon un tope de gasto.

> Antes de subir vídeos con caras de menores, lee las condiciones de datos de Google: normalmente el nivel gratuito permite usar el contenido para mejorar sus productos y el de pago no. Con dibujos o capturas de pizarra no hay problema.

### 2. Subir el proyecto a GitHub
Crea un repositorio **privado** y sube esta carpeta entera (con `mister/`, `docs/`, `netlify/`, `netlify.toml` y `package.json`).

> Importante: para que las funciones con IA se instalen bien, Netlify tiene que desplegar desde Git. Arrastrar la carpeta a Netlify Drop **no sirve** para esta versión.

### 3. Conectar Netlify
app.netlify.com → *Add new site* → *Import an existing project* → elige tu repo. No cambies nada: `netlify.toml` ya indica la carpeta `docs` y las funciones.

### 4. Variables de entorno
En Netlify: *Site configuration → Environment variables*:

| Nombre | Valor |
|---|---|
| `GEMINI_API_KEY` | la clave del paso 1 |
| `GEMINI_MODEL` | (opcional) nombre del modelo si quieres cambiarlo. Por defecto `gemini-3.8-flash`; si Google lo renombra o lo retira, pon aquí el modelo Flash vigente (lista en ai.google.dev/gemini-api/docs/models) |
| `MISTER_PASSWORD` | una contraseña que inventes (la usarás en tu panel; sin ella nadie puede gastar tu IA) |

Vuelve a desplegar (*Deploys → Trigger deploy*). Tu web queda en `https://tu-nombre.netlify.app`: esa es la dirección que pasas a los jugadores.

### 5. Configurar tu panel
Abre `mister/index.html` en tu ordenador → ⚙️ *Conexión con la IA* → pega la dirección de tu web y tu contraseña. Se guardan en tu navegador.

## Uso semanal

1. Abre `mister/index.html`.
2. **A**: sube la foto del dibujo o un vídeo (+ una nota si quieres) → *Analizar*. Tarda 30-90 s.
   **B**: o escribe con palabras lo que has visto (esto funciona sin IA ni internet).
3. Revisa las pestañas *Sesión del míster* y *Vista del jugador*.
4. *Publicar* → carga tu `docs/sessions.json` actual → descarga el actualizado → sustitúyelo en `docs/` y haz commit en GitHub. Netlify lo publica solo.

## Base metodológica

La IA recibe un resumen del *Manual de la UEFA para entrenadores de futsal* (desmarque de apoyo y de ruptura, zona despejada/tapada, amplitud y profundidad, triángulos, aclarado, modelo cognitivo y objetivos de la etapa sub-14/15). Está en `netlify/functions/lib/knowledge.mjs`: puedes editarlo y añadir más contenido del manual. El panel offline (opción B) también cita las páginas del manual en cada sesión.

## Notas

- **Vídeo:** se leen 8 fotogramas en tu navegador; el vídeo en sí no se sube a ningún sitio. Funciona con MP4 o WebM. Si tu navegador no lo abre, sube capturas.
- **Dibujo:** cuanto más claro (flechas gruesas, jugadores numerados), mejor lo interpreta. Puedes subir varias fotos.
- **Privacidad:** las imágenes se envían a la API de Gemini (Google) para analizarlas. En la ficha pública solo se publican 1-3 miniaturas: revisa que no salgan caras de menores en un vídeo antes de publicar (en la pestaña *Vista del jugador* ves exactamente lo que verán).
- **Revisa siempre lo que devuelve la IA** antes de publicar: es un borrador de un entrenador ayudante, no sustituye tu criterio.
- Las pruebas locales están en `tools/` (`node tools/test-functions.mjs`).
