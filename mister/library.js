/* Biblioteca de diagnósticos -> sesiones. Se usa en el navegador (panel del míster) y en Node. */
(function (root) {
  const A = (id, team, label, path, emoji) => ({ id, team, label, path, emoji: emoji || [] });

  /* ───────────────────────── ESCENAS ANIMADAS ───────────────────────── */

  // 1) BLOQUE -> separarse (carriles / ancho y profundo)
  const escBloque = {
    titulo: 'Del bloque a la pista abierta',
    clave: 'Mira tus pies: ¿hay otro compañero a menos de 5 pasos? ¡Sepárate! Uno ancho, uno cerca, uno profundo.',
    mal: {
      dur: 6000,
      actors: [
        A('a1', 'a', '1', [[0, 140, 90], [1, 142, 92]]),
        A('a2', 'a', '2', [[0, 165, 110], [1, 166, 111]]),
        A('a3', 'a', '3', [[0, 150, 125], [1, 151, 126]]),
        A('a4', 'a', '4', [[0, 170, 85], [1, 171, 86]]),
        A('b1', 'b', 'R', [[0, 215, 98], [.3, 212, 92], [.6, 212, 108], [1, 215, 98]]),
        A('b2', 'b', 'R', [[0, 215, 122], [.3, 212, 116], [.6, 212, 128], [1, 215, 122]])
      ],
      ball: [[0, 140, 90], [.15, 140, 90], [.25, 165, 110], [.4, 165, 110], [.5, 150, 125], [.65, 150, 125], [.75, 170, 85], [1, 170, 85]],
      zones: [{ x: 250, y: 20, w: 130, h: 160, label: 'Espacio vacío 😴', from: 0, to: 1.01 }],
      notes: [{ from: 0, to: 1.01, text: '❌ Todos juntos: al rival le basta con 2 jugadores para taparnos a los 4.' }]
    },
    bien: {
      dur: 7000,
      actors: [
        A('a1', 'a', '1', [[0, 110, 35], [.38, 110, 35], [1, 235, 22]]),
        A('a2', 'a', '2', [[0, 150, 100], [.15, 150, 100], [.55, 210, 65], [.62, 210, 65], [1, 265, 55]]),
        A('a3', 'a', '3', [[0, 110, 165], [.3, 110, 165], [.78, 200, 140], [.84, 200, 140], [1, 225, 130]]),
        A('a4', 'a', '4', [[0, 260, 100], [.5, 260, 100], [.55, 250, 115], [.96, 300, 85], [1, 300, 85]]),
        A('b1', 'b', 'R', [[0, 200, 95], [.3, 170, 60], [.55, 190, 80], [.78, 210, 115], [1, 235, 105]]),
        A('b2', 'b', 'R', [[0, 205, 125], [.3, 200, 110], [.55, 230, 95], [.78, 240, 110], [1, 300, 115]])
      ],
      ball: [[0, 150, 100], [.15, 150, 100], [.3, 110, 35], [.38, 110, 35], [.55, 210, 65], [.62, 210, 65], [.78, 200, 140], [.84, 200, 140], [.96, 300, 85], [1, 300, 85]],
      zones: [{ x: 195, y: 40, w: 70, h: 50, label: '¡HUECO!', from: .36, to: .62 }],
      notes: [
        { from: 0, to: .3, text: '1️⃣ Nos abrimos: uno ancho, uno cerca, uno profundo.' },
        { from: .3, to: .6, text: '2️⃣ Paso y CORTO al hueco que se ha abierto.' },
        { from: .6, to: 1.01, text: '3️⃣ Todos se mueven: siempre hay alguien libre.' }
      ]
    }
  };

  // 2) ESTÁTICO -> pasa y muévete
  const escEstatico = {
    titulo: 'Pasa y muévete (3 segundos)',
    clave: 'Pasar NO es el final de tu jugada: es el principio de la siguiente. Pasas, cuentas 1-2-3 y ya estás en otro hueco.',
    mal: {
      dur: 6000,
      actors: [
        A('a1', 'a', '1', [[0, 90, 100], [1, 90, 100]], [{ from: .3, to: 1.01, text: '🧍' }]),
        A('a2', 'a', '2', [[0, 190, 55], [1, 191, 56]]),
        A('a3', 'a', '3', [[0, 190, 150], [1, 191, 150]], [{ from: .75, to: 1.01, text: '🧍' }]),
        A('b1', 'b', 'R', [[0, 150, 100], [.3, 175, 70], [.7, 175, 125], [1, 175, 125]])
      ],
      ball: [[0, 90, 100], [.15, 90, 100], [.3, 190, 55], [.45, 190, 55], [.7, 190, 150], [1, 190, 150]],
      zones: [],
      notes: [{ from: 0, to: 1.01, text: '❌ Pasa y se queda mirando: el rival se coloca fácil y roba.' }]
    },
    bien: {
      dur: 6500,
      actors: [
        A('a1', 'a', '1', [[0, 90, 100], [.1, 90, 100], [.68, 215, 110], [.75, 215, 110], [1, 320, 95]], [{ from: .12, to: .4, text: '1-2-3' }]),
        A('a2', 'a', '2', [[0, 190, 55], [.35, 190, 55], [1, 250, 45]]),
        A('a3', 'a', '3', [[0, 190, 150], [.25, 190, 150], [.45, 150, 160], [.8, 280, 130], [1, 280, 130]]),
        A('b1', 'b', 'R', [[0, 150, 100], [.25, 170, 70], [.5, 170, 85], [.7, 200, 95], [.9, 255, 120], [1, 265, 125]])
      ],
      ball: [[0, 90, 100], [.1, 90, 100], [.25, 190, 55], [.35, 190, 55], [.7, 215, 110], [.75, 215, 110], [.95, 280, 130], [1, 280, 130]],
      zones: [{ x: 190, y: 90, w: 55, h: 40, label: 'Espalda', from: .3, to: .7 }],
      notes: [
        { from: 0, to: .35, text: '1️⃣ Pasas… ¡y ya estás en marcha!' },
        { from: .35, to: .75, text: '2️⃣ Te ofreces en la espalda del rival, en movimiento.' },
        { from: .75, to: 1.01, text: '3️⃣ Siempre hay alguien libre: nadie se queda esperando.' }
      ]
    }
  };

  // 3) ESPACIOS -> uno arrastra, otro rellena
  const escEspacios = {
    titulo: 'Uno arrastra, otro rellena',
    clave: 'El espacio no aparece solo: lo fabricas. Si te llevas a tu marcador, tu compañero encuentra el hueco.',
    mal: {
      dur: 6000,
      actors: [
        A('a1', 'a', '1', [[0, 130, 70], [.5, 185, 85], [1, 188, 86]]),
        A('a2', 'a', '2', [[0, 150, 130], [.5, 185, 122], [1, 188, 122]]),
        A('b1', 'b', 'R', [[0, 200, 85], [1, 198, 88]]),
        A('b2', 'b', 'R', [[0, 205, 125], [1, 203, 124]])
      ],
      ball: [[0, 130, 70], [.5, 185, 85], [1, 188, 86]],
      zones: [],
      notes: [{ from: 0, to: 1.01, text: '❌ Los dos van de frente al marcador: no hay hueco y se atascan.' }]
    },
    bien: {
      dur: 6500,
      actors: [
        A('a1', 'a', '1', [[0, 130, 100], [.45, 200, 45], [1, 200, 45]]),
        A('a2', 'a', '2', [[0, 150, 160], [.3, 150, 160], [.65, 215, 105], [1, 260, 100]]),
        A('b1', 'b', 'R', [[0, 190, 95], [.4, 200, 60], [.6, 215, 55], [1, 220, 55]]),
        A('b2', 'b', 'R', [[0, 195, 130], [.5, 200, 125], [.72, 225, 115], [1, 255, 105]])
      ],
      ball: [[0, 130, 100], [.45, 200, 45], [.72, 215, 105], [1, 260, 100]],
      zones: [{ x: 195, y: 85, w: 55, h: 45, label: 'HUECO', from: .4, to: .72 }],
      notes: [
        { from: 0, to: .4, text: '1️⃣ Llevas a tu marcador hacia fuera.' },
        { from: .4, to: .72, text: '2️⃣ Se abre el hueco… ¡tu compañero entra!' },
        { from: .72, to: 1.01, text: '3️⃣ Pase al hueco y a por la portería.' }
      ]
    }
  };

  // 4) LECTURA -> cabeza arriba
  const escLectura = {
    titulo: 'Cabeza arriba: lee antes de decidir',
    clave: 'Mira ANTES de recibir y ANTES de decidir: balón + rival + hueco. Dos miradas y ya sabes qué vas a hacer.',
    mal: {
      dur: 6000,
      actors: [
        A('a1', 'a', '1', [[0, 110, 100], [.5, 190, 95], [1, 200, 95]], [{ from: .1, to: .6, text: '🙈' }]),
        A('a2', 'a', '2', [[0, 160, 40], [1, 161, 40]]),
        A('a3', 'a', '3', [[0, 160, 160], [1, 161, 160]]),
        A('b1', 'b', 'R', [[0, 210, 80], [.5, 200, 92], [1, 200, 94]]),
        A('b2', 'b', 'R', [[0, 210, 125], [.5, 205, 105], [1, 205, 104]])
      ],
      ball: [[0, 110, 100], [.5, 190, 95], [1, 200, 95]],
      zones: [],
      notes: [{ from: 0, to: 1.01, text: '❌ Cabeza abajo: no ve que sus compañeros están libres. Pierde el balón.' }]
    },
    bien: {
      dur: 6500,
      actors: [
        A('a1', 'a', '1', [[0, 110, 100], [.3, 140, 100], [1, 140, 100]], [{ from: .08, to: .4, text: '👀' }]),
        A('a2', 'a', '2', [[0, 160, 40], [.2, 160, 40], [.6, 235, 45], [1, 300, 40]]),
        A('a3', 'a', '3', [[0, 160, 160], [1, 170, 150]]),
        A('b1', 'b', 'R', [[0, 210, 80], [.3, 185, 98], [1, 190, 100]]),
        A('b2', 'b', 'R', [[0, 210, 125], [.3, 195, 115], [1, 200, 110]])
      ],
      ball: [[0, 110, 100], [.3, 140, 100], [.38, 140, 100], [.6, 235, 45], [1, 300, 40]],
      zones: [{ x: 215, y: 18, w: 80, h: 55, label: 'ESPACIO LIBRE', from: .15, to: .6 }],
      notes: [
        { from: 0, to: .4, text: '1️⃣ Levanta la cabeza: balón, rival, hueco.' },
        { from: .4, to: .65, text: '2️⃣ Ve el espacio libre y pasa ya.' },
        { from: .65, to: 1.01, text: '3️⃣ El compañero que se mueve recibe y ataca.' }
      ]
    }
  };

  /* ───────────────────────── DIAGNÓSTICOS ───────────────────────── */

  const TAGS = {
    bloque: {
      nombre: 'Se mueven en bloque / no abren campo',
      palabras: ['bloque', 'juntos', 'pegados', 'agrupados', 'amontonados', 'mismo carril'],
      titulo: 'Rompe el bloque: ¡sepárate!',
      concepto: 'Cuando los cuatro estáis juntos, al rival le basta con tapar un solo sitio y os defiende a todos. Si os separáis, el rival tiene que elegir… ¡y siempre llega tarde! Abrir el campo es la forma más rápida de que el balón corra libre y de que tú seas más peligroso.',
      reto: 'Regla de oro: nunca dos compañeros en el mismo carril. ¿Eres el ancho, el cercano o el profundo?',
      conBalon: ['Levanta la cabeza antes de pasar: ¿quién está más libre, el cercano o el lejano?', 'Pasa al que está lejos del rival, no al que lo tiene pegado.', 'Si nadie está libre, conduce hacia un hueco: así obligas a que alguien se mueva.'],
      sinBalon: ['Si tu compañero está cerca, ¡sepárate tú! Ve a otro carril (ancho o profundo).', 'Intenta estar siempre a 6 pasos o más de tu compañero más cercano.', 'Triángulo, no línea: tú, el del balón y un tercero formáis un triángulo.'],
      escena: escBloque,
      regla: 'Si dos atacantes están a menos de 4 m del mismo compañero, pierdes el balón / punto de castigo.',
      preguntas: [
        '¿Cuántos rivales hacen falta para defendernos cuando estamos juntos? ¿Y cuando estamos abiertos?',
        'Congelo la jugada: ¿quién está pegado a otro compañero? ¿Qué habría pasado si uno se hubiera abierto?',
        'Si eres el que pasa, ¿dónde está el compañero con más espacio? ¿Cómo lo has sabido?'
      ],
      bloques: [
        { nombre: 'Calentamiento / Activación cognitiva', min: 12, tarea: 'Circuito de pases por carriles. Media pista dividida en 3 franjas; 4 jugadores con 1 balón (luego 2).', reglas: ['Nunca dos jugadores en el mismo carril.', 'Tras pasar, el pasador cambia de carril antes de que llegue el balón.', 'Máx. 2 toques. En el minuto 6 entra un segundo balón.'] },
        { nombre: 'Progresión 1 · Tarea condicionada', min: 20, tarea: '2v1 + comodín exterior en pista 20×20 m. Rotación de roles cada 2 min.', reglas: ['Gol válido solo si antes hubo un pase entre dos atacantes separados 6 m o más.', 'Si dos atacantes están a menos de 4 m, el defensor puede robar y marcar "gol de castigo".', 'Máx. 3 toques por jugador.'] },
        { nombre: 'Progresión 2 · Tarea táctica principal', min: 25, tarea: '3v3 + comodín (siempre con quien tiene el balón) en media pista con 4 carriles marcados.', reglas: ['El pasador cambia de carril tras cada pase.', 'Gol doble si en la jugada participaron 3 carriles distintos.', 'Si el equipo queda agrupado (3 jugadores en 2 carriles o menos) más de 5 s, pierde el balón.'] },
        { nombre: 'Situación real · Transferencia', min: 15, tarea: 'Partido 4v4 con porteros en pista completa.', reglas: ['Gol tras jugada con 3 pases y atacantes en 3 carriles distintos = vale 2.', 'Tú congelas la jugada ("¡foto fija!") cuando veas bloque y haces las preguntas.'] }
      ]
    },

    estatico: {
      nombre: 'Se quedan parados esperando el balón',
      palabras: ['parado', 'parados', 'quieto', 'quietos', 'estátic', 'estatic', 'esperando', 'mirando', 'tras el pase', 'después de pasar'],
      titulo: 'Pasa y muévete: ¡nunca te quedes parado!',
      concepto: 'Pasar y quedarte parado es como dejar la consola en pausa: el partido sigue y tú no juegas. Un pase no termina tu jugada, ¡empieza la siguiente! Si te mueves después de pasar, tu rival nunca sabe dónde vas a aparecer.',
      reto: 'Regla de oro: pasas, y antes de 3 segundos ya estás en otro sitio. ¿A qué hueco te vas?',
      conBalon: ['Pasa con intención y empieza a contar 1-2-3 mientras te mueves.', 'Pase y corte: pasa y corre a la espalda del rival.', 'Recibe de cara y en movimiento, no parado.'],
      sinBalon: ['Prohibido quedarte mirando: pasas = te mueves.', 'Pide el balón con el cuerpo (moviéndote al hueco), no solo con la mano.', 'Si un compañero conduce, ocúpale el sitio que deja libre.'],
      escena: escEstatico,
      regla: 'Tras cada pase, el pasador tiene 3 s para llegar a otro espacio; si el míster lo ve parado, el balón cambia de equipo.',
      preguntas: [
        '¿Qué hacías justo después de pasar? ¿Y qué podrías hacer en esos 3 segundos?',
        'Si yo fuera el rival, ¿dónde te encontraría fácil? ¿Y cómo te escondo si te mueves?',
        '¿Hacia dónde se mueve tu compañero cuando tú pasas? ¿Cómo lo sabes?'
      ],
      bloques: [
        { nombre: 'Calentamiento / Activación cognitiva', min: 12, tarea: 'Pase y sigue. Cuadrado de 15×15 m, 4 jugadores y 1 balón; luego 2 balones.', reglas: ['El que pasa ocupa el puesto del que recibe (pase y sigue).', 'Cambia de dirección cada 30 s a tu señal.', 'Prohibido quedarse quieto más de 2 s.'] },
        { nombre: 'Progresión 1 · Tarea condicionada', min: 20, tarea: '2v2 en pista de 15×12 m con porterías pequeñas.', reglas: ['Tras pasar, el pasador debe pisar una "zona de salida" marcada con aros/conos antes de volver a tocar.', 'Máx. 2 toques; 3 s sin moverse = balón del rival.', 'Cambio de pareja cada 3 min.'] },
        { nombre: 'Progresión 2 · Tarea táctica principal', min: 25, tarea: '3v3 + comodín en media pista con circulación continua.', reglas: ['Gol solo si antes hubo un pase y corte (pasar y atacar el espacio a la espalda).', 'Si un jugador pasa y se queda parado, el míster dice "¡pausa!" y el rival recupera.', 'El comodín no puede tocar dos veces seguidas.'] },
        { nombre: 'Situación real · Transferencia', min: 15, tarea: 'Partido 4v4 con porteros.', reglas: ['Gol vale doble si arranca con "pase y corte".', 'Un gol "sin esperar" (en menos de 8 s) vale 3.'] }
      ]
    },

    espacios: {
      nombre: 'No crean espacios (no arrastran marcas)',
      palabras: ['espacio', 'hueco', 'arrastr', 'marca', 'marcador', 'desmarque', 'desmarc'],
      titulo: 'Crea el hueco: uno arrastra, otro entra',
      concepto: 'Un espacio libre no aparece por arte de magia: ¡lo creas tú! Si te mueves para llevarte a tu marcador, dejas un hueco por el que entra tu compañero. Los mejores no solo corren al hueco: lo fabrican.',
      reto: '¿Quién puede ocupar el hueco que acabo de dejar? Uno arrastra, otro rellena.',
      conBalon: ['Conduce hacia fuera para arrastrar al defensor y suelta el pase al hueco.', 'Pasa al que entra en el espacio, no al que ya estaba.', 'Si el rival no se mueve, muévelo tú con una conducción más larga.'],
      sinBalon: ['Llévate a tu marcador: ve a un sitio para abrir otro.', 'Cuando alguien se va, ¡entra tú! Uno sale, otro entra.', 'Nunca dos jugadores en el mismo hueco.'],
      escena: escEspacios,
      regla: 'Gol válido solo si antes un compañero "arrastró" a su marcador (movimiento sin balón de 5 m o más) y otro entró en el hueco.',
      preguntas: [
        '¿Dónde estaba el rival antes y dónde está ahora que te has movido? ¿Qué espacio ha quedado?',
        '¿Quién iba a rellenar el hueco que has dejado? ¿Os lo habíais dicho?',
        'Si te quedas, ¿el rival se mueve? Si te mueves, ¿qué cambia?'
      ],
      bloques: [
        { nombre: 'Calentamiento / Activación cognitiva', min: 12, tarea: 'Pares en cuadrado de 12×12 m con un defensor "sombra". El atacante intenta soltarse y recibir.', reglas: ['Mira siempre al defensor: cuando se mueve, tú te mueves al lado contrario.', 'Cambio de roles cada minuto.', 'Máx. 2 toques.'] },
        { nombre: 'Progresión 1 · Tarea condicionada', min: 20, tarea: '2v2 con zona objetivo central (10×6 m) marcada con conos.', reglas: ['Un atacante "arrastra" (sale de la zona con el marcador) y el otro entra con balón.', 'Gol solo si el pase llega a la zona central y el que entra no es quien arrastró.', 'Cambio de roles cada 2 min.'] },
        { nombre: 'Progresión 2 · Tarea táctica principal', min: 25, tarea: '3v3 + comodín en media pista con zona libre.', reglas: ['Un jugador debe "arrastrar" antes de que otro entre: así el gol vale doble.', 'Si dos entran en el mismo hueco, el balón cambia de equipo.', 'Máx. 3 toques.'] },
        { nombre: 'Situación real · Transferencia', min: 15, tarea: 'Partido 4v4 con porteros.', reglas: ['Gol tras arrastre + entrada = vale 2.', 'Tú anuncias el "hueco" en voz alta si lo detectas y los jugadores lo aprovechan.'] }
      ]
    },

    lectura: {
      nombre: 'Lentitud de lectura (cabeza abajo)',
      palabras: ['lent', 'leer', 'lectura', 'mirar', 'cabeza', 'decide', 'decisión', 'decision', 'tarde'],
      titulo: 'Cabeza arriba: lee antes de recibir',
      concepto: 'Los mejores jugadores ven el pase antes de recibir el balón. Si mirar el campo se convierte en un hábito, tu cerebro irá más rápido que el de tus rivales. Es entrenar la cabeza para que las piernas lleguen a tiempo.',
      reto: 'Antes de recibir, mira dos veces: ¿dónde está el rival? ¿dónde está el hueco?',
      conBalon: ['Levanta la cabeza antes de que te llegue el balón (2 miradas).', 'Si no ves hueco, juega fácil y muévete.', 'Decide antes de recibir: 1 o 2 toques, no 5.'],
      sinBalon: ['Mira balón + rival + hueco; nunca solo el balón.', 'Cuando el balón cambia de lado, cambia tú de sitio también.', 'Grita el espacio que ves: «¡Arriba!», «¡Hueco!».'],
      escena: escLectura,
      regla: 'Antes de recibir hay que mirar 2 veces; el míster pregunta "¿qué viste?" y si no lo sabe, la jugada no vale.',
      preguntas: [
        '¿Qué viste justo antes de recibir? ¿Qué rival, qué hueco?',
        '¿Cuántas veces has levantado la cabeza antes de pasar?',
        'Si hubieras mirado un segundo antes, ¿qué habrías elegido distinto?'
      ],
      bloques: [
        { nombre: 'Calentamiento / Activación cognitiva', min: 12, tarea: 'Rondo 4v1 con señales: el míster levanta un color y el jugador con balón debe ver y pasar al compañero que lleva ese peto.', reglas: ['Los jugadores sin balón llevan petos de colores distintos.', 'Pase al color que dice el míster (que gira a espalda del jugador).', 'Máx. 2 toques.'] },
        { nombre: 'Progresión 1 · Tarea condicionada', min: 20, tarea: '2v2 en pista de 15×12 m con porterías pequeñas.', reglas: ['Antes de pasar hay que decir en voz alta «¡hueco!» o el nombre de quien recibe.', 'Máx. 2 toques; si reciben sin mirar, balón del rival.', 'Cambio de pareja cada 3 min.'] },
        { nombre: 'Progresión 2 · Tarea táctica principal', min: 25, tarea: '3v3 + comodín en media pista, con "estímulo" del míster que obliga a mirar.', reglas: ['A la voz del míster ("¡cambio!") el equipo debe cambiar de lado con un pase.', 'Se premia con gol doble al jugador que anuncia el espacio antes del pase.', 'Máx. 3 toques.'] },
        { nombre: 'Situación real · Transferencia', min: 15, tarea: 'Partido 4v4 con porteros.', reglas: ['Gol vale doble si antes de recibir el goleador miró 2 veces (se lo preguntas).', 'Pausa tras cada gol: "¿qué viste?"'] }
      ]
    }
  };

  /* ───────────────────────── FUNCIONES ───────────────────────── */

  // Base metodológica: Manual de la UEFA para entrenadores de futsal (páginas impresas)
  const MANUAL = {
    bloque: 'Amplitud y profundidad (p.59-60): la progresión del ataque se basa en ocupar el campo a lo ancho y en profundo. Aclarado (p.98): alejarse de la situación para separar coberturas y crear espacio.',
    estatico: 'p.86: para el poseedor es "extremadamente negativo" que sus compañeros permanezcan estáticos. El desmarque (zigzag, cambios de dirección y de ritmo, diagonales) debe hacerse en el momento en que el poseedor puede pasar.',
    espacios: 'p.86-87: desmarque de apoyo (acerca al receptor, opción segura) y de ruptura (aleja del poseedor, se acerca a portería); zona despejada vs zona tapada; el desmarque a la espalda del defensor es muy eficaz. Aclarado (p.98).',
    lectura: 'p.63 (modelo cognitivo): no dar toda la información, dejar que el jugador la descubra y hacerle pensar constantemente. p.64: en sub-14/15 se desarrollan las capacidades perceptivo-decisionales con juegos reducidos 1x1, 2x2, 3x3.'
  };

  function detectTags(text) {
    const t = (text || '').toLowerCase();
    return Object.keys(TAGS).filter(k => TAGS[k].palabras.some(p => t.includes(p)));
  }

  function uniq(arr) { return arr.filter((x, i) => arr.indexOf(x) === i); }

  function buildSession(opts) {
    const tags = (opts.tags || []).filter(t => TAGS[t]);
    if (!tags.length) throw new Error('Elige al menos un diagnóstico');
    const fecha = opts.fecha || new Date().toISOString().slice(0, 10);
    const main = TAGS[tags[0]];
    const id = fecha + '-' + tags.join('-');

    const conBalon = uniq(tags.flatMap(t => TAGS[t].conBalon)).slice(0, 4);
    const sinBalon = uniq(tags.flatMap(t => TAGS[t].sinBalon)).slice(0, 4);

    // preguntas: ronda entre diagnósticos hasta 3
    const preguntas = [];
    for (let i = 0; preguntas.length < 3 && i < 3; i++) {
      tags.forEach(t => { if (preguntas.length < 3 && TAGS[t].preguntas[i]) preguntas.push(TAGS[t].preguntas[i]); });
    }

    const bloques = main.bloques.map((b, i) => {
      const extra = i > 0 ? tags.slice(1).map(t => '➕ (' + TAGS[t].nombre + ') ' + TAGS[t].regla) : [];
      return Object.assign({}, b, { reglas: b.reglas.concat(extra) });
    });

    return {
      id,
      fecha,
      titulo: opts.titulo || main.titulo,
      tags,
      jugador: {
        concepto: main.concepto,
        reto: main.reto,
        conBalon,
        sinBalon,
        escenas: tags.slice(0, 3).map(t => TAGS[t].escena)
      },
      mister: {
        contexto: opts.idea || '',
        manual: tags.map(t => MANUAL[t]).filter(Boolean),
        bloques,
        preguntas
      }
    };
  }

  function publicVersion(s) {
    return { id: s.id, fecha: s.fecha, titulo: s.titulo, tags: s.tags, jugador: s.jugador };
  }

  const API = { TAGS, buildSession, publicVersion, detectTags };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.FutsalLib = API;
})(typeof window !== 'undefined' ? window : globalThis);
