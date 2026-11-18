# PRINT RUSH

**Videojuego 2D de gestión de imprentas y atención al cliente para FP de Artes Gráficas.**

## Rediseño V0.2 · En revisión

La rama [redesign-2d](https://github.com/TCardell/print-rush/tree/redesign-2d) contiene el nuevo juego de gestión con React + TypeScript. Se ha sustituido la escena isométrica como interfaz principal por un panel 2D dividido en:

- Entradas: mostrador, teléfono, correo y recogidas con tiempos de espera.
- Atención: conversaciones, aclaración de datos, consulta de pedidos y decisiones profesionales.
- Taller: una impresora animada, trabajos en cola, impresión, acabados y recogidas.
- Resumen: reloj, caja, reputación, puntuación, flujo de trabajo y registro de eventos.

## Estado funcional

- Ciclo automático de llegada, producción y recogida.
- Los pedidos y comunicaciones permanecen relacionados.
- Interacciones con efectos distintos según se revisen o no los datos.
- Reloj, pausa, doble velocidad, incremento de solicitudes y fin de partida por reputación.
- Maqueta vectorial 2D de máquina y productos.
- Interfaz adaptada a escritorio y móvil; compatibilidad con movimiento reducido.

**Pendiente:** equilibrado, pruebas con alumnado, Catalán, accesibilidad integral, guardado, modos de juego adicionales y economía tycoon.

La rama **main** conserva la versión isométrica 0.1 publicada hasta que el rediseño haya sido revisado.

## Desarrollo

Se requiere Node.js 22 o superior.

\`\`\`sh
npm install
npm run dev
\`\`\`

El entorno local abre normalmente en http://localhost:5173. Para compilar:

\`\`\`sh
npm run build
\`\`\`

## Publicación

El flujo de GitHub Pages en main se ejecuta automáticamente con cada push a main. **La rama de rework no se publica automáticamente** para preservar la versión estable.
