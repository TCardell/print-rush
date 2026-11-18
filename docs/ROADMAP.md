# PRINT RUSH — Rework 2D

## Motivo
La escena isométrica 0.1 funcionó como prueba técnica, pero no ofrecía una interfaz visual suficientemente atractiva ni dejaba claro el núcleo de atención al cliente. Se conserva en la rama main hasta validar el rediseño.

## Nuevo enfoque
- Panel principal 2D de gestión con estética de videojuego y tipografía editorial.
- Producción visible a través de una impresora animada y un flujo de trabajos.
- Solicitudes conectadas con expedientes persistentes.
- El modo RUSH penaliza compromisos no comprobados y esperas excesivas.
- React gestiona la interfaz; un motor TypeScript puro gestiona la simulación.

## Versiones
- [x] 0.1 — Validación de Phaser y escenario isométrico.
- [x] 0.2 — Primera interfaz 2D y bucle de atención, producción y entrega.
- [ ] 0.2.1 — Pruebas, errores de simulación, accesibilidad y ajustes visuales.
- [ ] 0.3 — Reclamaciones, llamadas y correos con casos contextualizados más diversos.
- [ ] 0.4 — Economía tycoon y mejoras.
- [ ] 0.5 — Guardado, clientes recurrentes y progresión a largo plazo.

## Criterios pedagógicos
- No ocultar errores, documentar acuerdos y consultar estados antes de prometer plazos.
- Explicaciones comprensibles, tiempo pausado cuando sea necesario, catalán/castellano.
- La satisfacción y los compromisos cumplidos importan tanto como los beneficios.

## Arquitectura
- src/game/engine.ts: reglas y evolución del mundo.
- src/App.tsx: pantalla, eventos y decisiones.
- src/styles/rework.css: diseño 2D.
- src/main.tsx: arranque de React.
