# PRINT RUSH

Videojuego educativo de gestión de imprentas y atención al cliente para FP de Artes Gráficas.

## Estado

**0.0.1: prueba de concepto técnica.** Contiene una planta isométrica geométrica provisional, tres zonas interactivas y el ciclo mínimo de un pedido (registrar → imprimir → recoger). **No es todavía el modo RUSH ni el diseño visual definitivo.**

## Ejecutarlo en local

Requiere Node.js 22 o superior y npm.

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite (normalmente http://localhost:5173).

Para construir el proyecto:

```bash
npm run build
```

## Arquitectura

- `src/scenes/PrintShopScene.ts`: prototipo visual y de interacción.
- `src/main.ts`: arranque de Phaser.
- `src/styles.css`: interfaz HTML.
- `docs/ROADMAP.md`: visión del proyecto y siguientes hitos.

La separación formal en motores de clientes, pedidos, producción, tiempo y economía se hará a partir de la fase 0.1. En 0.0.1, el objetivo es validar el ciclo mínimo.

## Publicación

Preparado para una futura publicación en GitHub Pages bajo `/print-rush/`. No hay despliegue automático activado todavía.

## Tecnología

Phaser 4 + TypeScript + Vite. Arte provisional dibujado con primitivas: no es el pixel art definitivo.

## Idiomas

Base inicial en castellano; se incorporará traducción catalán/castellano antes de usarlo como actividad final de clase.
