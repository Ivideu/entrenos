# Fútbol sala Infantil · Web de entrenamientos con IA (online y para el móvil)

## Qué hace

1. Entras desde el móvil o el ordenador a **`tu-web.netlify.app/panel/`** con tu contraseña.
2. Subes un **vídeo** (por ejemplo, una grabación de pantalla de un reel de Instagram), un **dibujo** o capturas, y escribes qué quieres que haga ("evalúa si sirve para que no se queden parados y adáptalo a 4v4").
3. La IA (Gemini) lo analiza, **evalúa el ejercicio** y te crea la **sesión de entrenamiento** (4 bloques + preguntas socráticas) y la **ficha para los jugadores** con pizarras animadas, siguiendo el Manual de la UEFA.
4. Tú la revisas y pulsas **Publicar**. Los jugadores la ven al instante en **`tu-web.netlify.app`**. Sin GitHub, sin archivos.

| Dirección | Quién | Qué es |
|---|---|---|
| `tu-web.netlify.app` | Jugadores | La ficha del día (y las anteriores) |
| `tu-web.netlify.app/panel/` | Tú | El panel; pide contraseña |

Todo lo que guardas (historial, sesiones) vive en tu cuenta de Netlify, así que lo ves igual desde el móvil y desde el ordenador.

## Vídeos de Instagram: cómo funciona (y su límite)

Instagram **no permite** que una web descargue sus vídeos, y la IA no puede entrar en Instagram. Lo que sí funciona, y es rápido desde el móvil:

1. Reproduce el reel y **graba la pantalla** (iPhone: desliza desde arriba a la derecha → botón de grabar; Android: ajustes rápidos → *Grabar pantalla*). También sirven 4-6 capturas de los momentos clave.
2. En el panel pulsa *Elegir archivo* y selecciona esa grabación.
3. (Opcional) Pega el enlace del reel para tenerlo de referencia en tu sesión.
4. Escribe qué quieres y pulsa **Analizar**. Tarda 30-90 segundos; puedes dejar la pantalla abierta.

Los vídeos no se suben enteros: el navegador saca 8 fotogramas y solo esas imágenes se envían a la IA.

> El vídeo de otra cuenta es de su autor. Para uso interno de entrenamiento, vale; pero **no publiques sus imágenes** en la web de los jugadores. Por eso, si pegas un enlace, el panel desmarca "Mostrar los fotogramas a los jugadores".

## Puesta en marcha (una sola vez, ~10 min)

### 1. Clave de Gemini
Entra en aistudio.google.com/apikey con tu cuenta de Google y crea una clave (*Create API key*). Hay un nivel gratuito con límites; revisa en Google AI Studio qué límites tiene tu cuenta y, si quieres más, activa la facturación con un tope de gasto.

> Antes de subir vídeos con caras de menores, lee las condiciones de datos de Google: normalmente el nivel gratuito permite usar el contenido para mejorar sus productos y el de pago no. Con dibujos o capturas de pizarra no hay problema.

### 2. Subir el proyecto a GitHub
Crea un repositorio **privado** y sube esta carpeta entera (con `docs/`, `netlify/`, `mister/`, `tools/`, `netlify.toml` y `package.json`).

> Netlify tiene que desplegar desde Git para instalar las funciones. Arrastrar la carpeta a Netlify Drop **no sirve**.

### 3. Conectar Netlify
app.netlify.com → *Add new site* → *Import an existing project* → elige tu repo. Deja *Base directory*, *Package directory* y *Build command* vacíos; *Publish directory* = `docs`, *Functions directory* = `netlify/functions` (ya vienen de `netlify.toml`).

### 4. Variables de entorno
*Site configuration → Environment variables*:

| Nombre | Valor |
|---|---|
| `GEMINI_API_KEY` | la clave del paso 1 |
| `MISTER_PASSWORD` | una contraseña **larga** que inventes (12 caracteres o más). Es lo único que impide que otros usen tu panel y tu IA |
| `GEMINI_MODEL` | (opcional) modelo principal. Por defecto `gemini-3.8-flash`. Si Google lo cambia, pon aquí el nombre vigente (ver «Cambiar de modelo de Gemini») |
| `GEMINI_FALLBACK_MODELS` | (opcional) modelos de respaldo, separados por comas, que se prueban si el principal está saturado o no existe. Por defecto `gemini-3.6-flash,gemini-3.5-flash-lite` |

Después: *Deploys → Trigger deploy*.

### 5. Entrar desde el móvil
Abre `https://tu-nombre.netlify.app/panel/`, escribe tu contraseña y listo (se queda recordada en ese móvil). Guárdalo como acceso directo: en el navegador, *Compartir/Menú → Añadir a pantalla de inicio*.

## Uso diario

1. Abre el panel → sube vídeo/dibujo + qué quieres → **Analizar** (o describe con palabras lo que has visto en la opción **B**).
2. Revisa *Sesión del míster* y *Vista del jugador* (es exactamente lo que verán).
3. **Publicar** → ya está en la web de los jugadores. *Compartir el enlace* lo manda por WhatsApp.
4. Puedes *Quitar de la web* o *Borrar* cuando quieras; el historial está en *Mis entrenamientos*.

## Cambiar de modelo de Gemini

La web ya reintenta sola si Gemini da un error 503 ("high demand", saturado) o 429, y si el modelo principal sigue fallando prueba los de respaldo. Al terminar, el panel dice con qué modelo se analizó. Si aun así quieres fijar tú el modelo:

1. En Netlify: **Site configuration → Environment variables → Add a variable**.
2. *Key*: `GEMINI_MODEL`. *Value*: el nombre exacto del modelo, por ejemplo `gemini-3.6-flash`.
3. **Deploys → Trigger deploy → Deploy site** (los cambios de variables solo se aplican en un despliegue nuevo).

¿Cuál es el nombre exacto? En aistudio.google.com elige un modelo en el desplegable de la derecha y pulsa **Get code**: en el código aparece `model: "…"`. También está la lista en ai.google.dev/gemini-api/docs/models. Si usaste uno en otro proyecto, es el mismo nombre. Un modelo que no existe da error 404; uno saturado da 503 y pasa solo.

## Si algo no va

- **No me sale el panel / dice que "esta dirección no tiene el servidor":** el panel solo funciona en tu dirección de **Netlify** (`https://tu-nombre.netlify.app/panel/`, con la barra final). **GitHub Pages no sirve** para esto: no puede ejecutar la IA. GitHub solo guarda los archivos; si lo tienes activado (*Settings → Pages*), puedes desactivarlo. Si lo mantienes, la rama es `main` y la carpeta `/docs` (no hay una rama llamada "docs").
- **Comprueba que `docs/panel/index.html` está en tu repositorio** de GitHub; si no está, sube de nuevo el contenido del zip. En Netlify mira *Deploys*: el último debe decir *Published*, y en *Functions* deben aparecer `start`, `status`, `manage`, `sessions` y `analyze-background`.

- **Contraseña incorrecta aunque es la buena:** comprueba que `MISTER_PASSWORD` está en Netlify y que has vuelto a desplegar después de crearla.
- **"Falta configurar GEMINI_API_KEY":** añade la variable y vuelve a desplegar.
- **Error de Gemini con el nombre del modelo:** pon un modelo vigente en `GEMINI_MODEL`.
- **"No puedo leer ese vídeo en este navegador":** haz 4-6 capturas de pantalla del vídeo y súbelas como imágenes (pasa a veces en iPhone con vídeos largos).
- **Los jugadores ven una sesión de ejemplo:** es lo normal hasta que publiques la primera.
- Si cambias algo en `mister/` o `docs/`, regenera el panel con `node tools/build-mister.mjs`.

## Seguridad

- La web de los jugadores solo recibe la parte pública de las sesiones publicadas. Tu sesión, tus notas y el enlace del vídeo son privados.
- No hay límite de intentos en el login: usa una contraseña larga.
- Las imágenes se envían a la API de Gemini (Google) para analizarlas; revisa en *Vista del jugador* que no salgan caras de menores antes de publicar fotogramas.
- **Revisa siempre lo que devuelve la IA**: es un borrador de ayudante, no sustituye tu criterio.

## Base metodológica

La IA recibe un resumen del *Manual de la UEFA para entrenadores de futsal* (desmarque de apoyo y de ruptura, zona despejada/tapada, amplitud y profundidad, triángulos, aclarado, modelo cognitivo y objetivos de la etapa sub-14/15). Está en `netlify/functions/lib/knowledge.mjs`: puedes editarlo y ampliarlo.

## Para desarrolladores

Pruebas locales: `node tools/test-functions.mjs` (49 comprobaciones con una IA simulada).
