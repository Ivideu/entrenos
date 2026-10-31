// SOLO para el míster. Cada entrada enlaza con la de datos-jugador.js por "id".
window.MISTER=[{
id:"2026-10-31",
observacion:"Se mueven en bloque, sin crear espacios, y se quedan estáticos esperando el balón (último partido).",
objetivo:"Que el que pasa se mueva a un espacio libre en menos de 2 s, y que nunca haya dos jugadores en la misma línea o pasillo con balón en juego.",
senales:["Tras el pase, el jugador arranca en <2 s.","Con balón, hay opciones en ancho y en profundidad, no en fila.","Suben los pases al hueco (desmarques de ruptura) respecto al último partido."],
anims:{dosvuno:{t:"2v1 · Pasa y sal a la espalda",pasos:[
{c:"A1 con balón, A2 abierto. B1 defiende.",A1:[70,95],A2:[90,25],B1:[130,80],ball:[70,95]},
{c:"A1 conduce y fija a B1.",A1:[105,90],B1:[125,88],ball:[105,90]},
{c:"Pasa y SALE a la espalda del defensor (máx. 2 s).",A2:[120,30],ball:[120,30],A1:[165,100],B1:[135,60]},
{c:"Pase de vuelta al espacio libre.",ball:[190,100],A1:[190,100],B1:[150,70]},
{c:"¡Gol doble!",ball:[298,90]}]}},
fases:[
{n:"Calentamiento: pasa y ocupa un cono libre",min:"10–15",t:"Activación cognitiva con movilidad constante",
d:"4 jugadores y 1 balón en 15×10 m con 6 conos repartidos. Cada jugador debe estar en un cono; quedan 2 libres.",
reglas:["Tras pasar, el pasador va a un cono libre; nunca dos en el mismo cono.","Nadie parado más de 2 s.","Progresión: 2 toques → 1 toque → 2 balones a la vez."]},
{n:"Progresión 1: 2v1 + portero, “pasa y sal”",min:"20",t:"Espacio reducido y desigualdad",anim:"dosvuno",
d:"Pista dividida en 2 zonas. 2 atacantes vs 1 defensor y portero. Rotan tras cada ataque (atacante → defensor → fila).",
reglas:["El pasador debe cruzar la línea del defensor en 2 s; si no, pierde la posesión.","Máx. 2 toques por jugador.","Gol tras pase de ruptura (al hueco) vale doble.","Progresión: 2v2 y luego 3v2."]},
{n:"Progresión 2: 3v3 + comodín, el triángulo vivo",min:"25",t:"Líneas de pase y movilidad continua",anim:"bien",
d:"Pista en 3 pasillos con conos. 3v3 + 1 comodín que siempre juega con quien tiene el balón (4v3) + portero.",
reglas:["Tras pasar, el pasador cambia de pasillo.","Dos atacantes en el mismo pasillo o línea = pierden el balón.","4 s sin tocar balón ni moverse = “tarjeta estática”: balón al rival.","Gol tras 3 pases con cambio de pasillo vale doble."]},
{n:"Transferencia: 4v4 con porteros",min:"15",t:"Juego real condicionado",
d:"Partido en pista completa con porteros. El objetivo del día puntúa doble.",
reglas:["Gol tras pase al hueco a un jugador que se desmarcó = 2 puntos.","Si gritas “¡Bloque!” y hay 3 o más de un equipo en 4 m de radio, balón al rival.","Sin condiciones extra en los últimos 3 min: ¿lo han interiorizado?"]}],
preguntas:["¿Dónde estabas cuando tu compañero levantó la cabeza? ¿Te podía ver o te tapaba un rival?","Congelo la imagen: ¿cuántos de los nuestros están en la misma línea o pasillo? ¿A quién ayuda eso?","Acabas de pasar: ¿qué hiciste en los 2 segundos siguientes y a qué espacio ibas?"]
}];
