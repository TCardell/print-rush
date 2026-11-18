# PRINT RUSH

**Videojuego educativo de gestión de imprentas y atención al cliente** para FP de Artes Gráficas.

## Estado: V0.1 · Primera escena ilustrada

Una imprenta isométrica con mostrador, impresora digital, mesa de acabados, estantería de recogidas, personajes animados y una interfaz de pedidos.

En esta versión puedes completar el primer ciclo: **recibir → imprimir → recoger**. Los encargos se mantienen en una cola con sus estados y puedes registrar varios pedidos mientras otro se imprime.

**Importante:** los gráficos actuales son una **ilustración vectorial isométrica provisional**, no el pixel art final. No hay todavía generación automática de clientes, llamadas, correos, economía ni modo RUSH.

## Jugar

Si GitHub Pages está activado con GitHub Actions:

https://tcardell.github.io/print-rush/

En el escenario:

1. Pulsa el **mostrador** para registrar un pedido.
2. Pulsa la **impresora** para empezar a producir el siguiente trabajo de la cola.
3. Pulsa **recogidas** cuando el trabajo esté listo.

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Para comprobar la compilación:

```bash
npm run build
```

## Arquitectura actual

- `src/scenes/ShopArt.ts`: escenario, props isométricos y personajes provisionales.
- `src/scenes/PrintShopScene.ts`: ciclo de pedidos e interacciones.
- `src/main.ts`: inicio de Phaser 4.
- `src/styles.css`: panel de control y estilos web.
- `docs/ROADMAP.md`: plan de desarrollo.

La simulación pasará a módulos independientes cuando incorporemos el reloj RUSH, las colas de clientes y la economía. **No incrustaremos la lógica de negocio en el arte isométrico.**

## Publicación

Las actualizaciones en `main` compilan y se publican mediante `.github/workflows/deploy.yml`. GitHub Pages necesita estar configurado con origen **GitHub Actions**.

## Objetivo didáctico

La atención al cliente es el eje: consultas, confirmación de encargos, comunicación de plazos, seguimiento, entregas e incidencias. La producción y el dinero son sistemas de juego que dan consecuencias a las decisiones.

## Licencia y recursos

El proyecto todavía no tiene licencia abierta definida. Los gráficos actuales son formas originales construidas con código. Antes de incorporar tilesets o sprites de terceros, comprobar sus licencias y atribuciones.
