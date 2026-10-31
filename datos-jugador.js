// Contenido que ven los jugadores. Añade cada sesión nueva AL FINAL de la lista.
window.JUGADOR=[{
id:"2026-10-31",fecha:"31 oct 2026",titulo:"Rompe el bloque",
concepto:"Hoy vamos a romper el bloque. Si los tres os juntáis, al rival le basta un defensor para taparos a todos; si os separáis, no llega a todo. El espacio no se encuentra: se crea moviéndote antes de que te llegue el balón, y eso te convierte en el jugador que siempre aparece libre.",
reto:"Acabas de pasar: ¿a qué espacio voy en los próximos 2 segundos? Regla de oro: nunca dos de los nuestros en la misma línea ni en el mismo pasillo.",
con:["Levanta la cabeza ANTES de recibir: mira qué hueco hay.","Conduce hacia el defensor para fijarlo y pasa cuando se venga hacia ti.","Pasa y sal: pasar no es descansar, es el pistoletazo para moverte.","Si nadie se ofrece, avisa y pídelo: tu equipo te tiene que ver."],
sin:["Ábrete ANCHO o profundo: busca la distancia de pase (5–8 m), ni pegado ni lejísimos.","Muévete cuando tu compañero levante la cabeza, no cuando ya ha pasado.","Finta y sal: da un paso hacia tu defensor y arranca al hueco que deja.","Mira cada 2 segundos: ¿hay dos de los míos en mi línea? Si sí, uno cambia."],
anims:{
mal:{t:"❌ En bloque: todos juntos y quietos",pasos:[
{c:"Los tres juntos en el mismo sitio: dos defensores controlan todo.",A1:[100,90],A2:[110,78],A3:[110,102],B1:[150,88],B2:[165,100],ball:[100,90]},
{c:"Pasan, pero nadie se mueve: un solo defensor tapa los dos pases.",ball:[110,78],B1:[135,82],B2:[150,96]},
{c:"Pase atrás… y el rival ya está encima. Sin espacio.",ball:[110,102],B1:[128,92],B2:[135,102]},
{c:"Balón perdido. Todos esperando, nadie ofreciendo.",ball:[130,94],B1:[130,94]}]},
bien:{t:"✅ Separados y en movimiento",pasos:[
{c:"Empezamos igual, pero ANTES del pase…",A1:[100,90],A2:[110,78],A3:[110,102],B1:[150,88],B2:[165,100],ball:[100,90]},
{c:"…abrimos: uno ANCHO y otro PROFUNDO. Los defensores se abren.",A2:[150,25],A3:[175,150],B1:[140,68],B2:[160,118]},
{c:"Pase al ancho y el pasador SALE al hueco del centro.",ball:[150,25],A1:[205,92],B1:[150,50],B2:[172,100]},
{c:"Pase al hueco: ocasión de gol.",ball:[205,92],A2:[225,35],B1:[175,62]},
{c:"¡Remate!",ball:[298,90]}]}
}}];
