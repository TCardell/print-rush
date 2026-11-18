import Phaser from 'phaser';

/**
 * Provisional vector-based isometric set. Kept separate from the simulation so
 * all art can later be replaced by a consistent pixel-art tileset and sprites.
 */
const V = (x: number, y: number) => new Phaser.Math.Vector2(x, y);
const C = {
  ink: 0x173e4b, wallLeft: 0xc7e0d5, wallRight: 0xe4e8d8,
  tile: 0xe4eee5, grout: 0x9eb9ae, woodTop: 0xf9dfab,
  woodSide: 0xc99461, sea: 0x3d8294, deep: 0x265267,
  orange: 0xf1a05f, green: 0x66b8a7, white: 0xfaf9ee,
};

function polygon(g: Phaser.GameObjects.Graphics, points: number[], color: number, alpha = 1): void {
  const vertices = [];
  for (let i = 0; i < points.length; i += 2) vertices.push(V(points[i], points[i + 1]));
  g.fillStyle(color, alpha).fillPoints(vertices, true);
}

/** cx,cy is center of the top diamond, height projects vertically down. */
function isoBox(g: Phaser.GameObjects.Graphics, cx: number, cy: number,
  width: number, depth: number, height: number,
  top: number, left: number, right: number): void {
  const a = [cx, cy - depth / 2], b = [cx + width / 2, cy],
    c = [cx, cy + depth / 2], d = [cx - width / 2, cy];
  polygon(g, [...d, ...c, c[0], c[1] + height, d[0], d[1] + height], left);
  polygon(g, [...c, ...b, b[0], b[1] + height, c[0], c[1] + height], right);
  polygon(g, [...a, ...b, ...c, ...d], top);
}

function text(scene: Phaser.Scene, x: number, y: number, label: string, size = 12,
  color = '#245263'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, label, {
    fontFamily: 'monospace', fontSize: size + 'px',
    fontStyle: 'bold', color,
  }).setOrigin(0.5);
}

function plant(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x294f54, 0.14).fillEllipse(x, y + 21, 47, 16);
  polygon(g, [x - 13, y + 4, x + 13, y + 4, x + 9, y + 25, x - 8, y + 25], 0xbc7962);
  g.lineStyle(3, 0x4d9476);
  g.lineBetween(x, y + 5, x - 11, y - 36);
  g.lineBetween(x, y + 5, x + 13, y - 39);
  g.lineBetween(x, y + 5, x + 1, y - 44);
  for (const [dx, dy, w] of [[-16,-28,24],[13,-28,27],[-4,-39,22],[5,-14,23]]) {
    g.fillStyle(0x428e69).fillEllipse(x + dx, y + dy, w, 11);
    g.fillStyle(0x7dc394, .7).fillEllipse(x + dx - 3, y + dy - 2, w / 2, 5);
  }
}

function pixelHuman(scene: Phaser.Scene, x: number, y: number, shirt: number,
  skin: number, hair: number): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  g.fillStyle(0x254f57, 0.2).fillEllipse(0, 4, 34, 12);
  g.fillStyle(0x3f5365).fillRect(-9, -15, 7, 18).fillRect(2, -15, 7, 18);
  g.fillStyle(0x26313b).fillRect(-10, 0, 8, 4).fillRect(2, 0, 9, 4);
  g.fillStyle(shirt).fillRoundedRect(-13, -40, 26, 29, 5);
  g.fillStyle(skin).fillRect(-17, -36, 5, 19).fillRect(12, -36, 5, 19);
  g.fillStyle(0xefbb8f).fillRect(-5, -43, 10, 7);
  g.fillStyle(skin).fillRoundedRect(-11, -63, 22, 23, 5);
  g.fillStyle(hair).fillRect(-12, -65, 24, 9).fillRect(-12, -60, 5, 10);
  g.fillStyle(0x173e4b).fillRect(-5, -52, 2, 2).fillRect(5, -52, 2, 2);
  const person = scene.add.container(x, y, [g]);
  return person;
}

export interface ShopArt {
  printerIndicator: Phaser.GameObjects.Arc;
  customer: Phaser.GameObjects.Container;
  worker: Phaser.GameObjects.Container;
  makeFinishedParcel: () => void;
  printPaper: () => void;
}

export function buildShopArt(scene: Phaser.Scene): ShopArt {
  const g = scene.add.graphics();

  // Frame, ambient background, rear walls and welcoming shop floor.
  g.fillGradientStyle(0xf2f0dd, 0xf2f0dd, 0xd1e7dc, 0xd1e7dc).fillRect(0, 0, 900, 590);
  g.fillStyle(0xa8c7b4, 0.10).fillEllipse(470, 350, 870, 500);
  polygon(g, [62,315,448,119,448,26,62,225], C.wallLeft);
  polygon(g, [448,119,838,315,838,223,448,26], C.wallRight);
  polygon(g, [62,315,448,119,838,315,448,510], C.tile);
  polygon(g, [62,315,448,510,448,533,62,337], 0x749e9a);
  polygon(g, [448,510,838,315,838,337,448,533], 0x577f8b);
  g.lineStyle(1, C.grout, 0.40);
  for (let i = 1; i < 11; i++) {
    const t = i / 11;
    g.lineBetween(62 + 386 * t, 315 - 196 * t, 448 + 390 * t, 510 - 195 * t);
    g.lineBetween(62 + 386 * t, 315 + 195 * t, 448 + 390 * t, 119 + 196 * t);
  }
  // Window on the far right wall.
  polygon(g, [563,97,720,177,720,242,563,161], 0x366d7d);
  polygon(g, [570,103,713,176,713,232,570,157], 0x96cdd1);
  polygon(g, [570,134,713,206,713,215,570,143], 0x559aaa, .46);
  g.lineStyle(5, 0xeaf5ec);
  g.lineBetween(643,139,643,196);
  // Wall signage and print samples on the left.
  polygon(g, [132,229,278,154,278,200,132,276], 0x2b6375);
  polygon(g, [140,226,270,160,270,191,140,259], 0xf3e9d4);
  polygon(g, [150,223,178,209,178,239,150,253], 0xe96d75);
  polygon(g, [184,206,213,191,213,224,184,238], 0xe9ba5a);
  polygon(g, [219,188,261,167,261,200,219,222], 0x47a4ac);
  // Small plants and lobby rug.
  polygon(g, [302,420,442,354,528,395,391,460], 0xe7ad8c, .42);
  plant(g, 114, 310);
  plant(g, 783, 332);

  const appliances = scene.add.graphics();
  // Digital printer: stacked feeder, print console, tray and ink dots.
  isoBox(appliances, 568, 226, 199, 112, 88, 0xe8f2ed, C.deep, 0x31758a);
  isoBox(appliances, 538, 179, 124, 70, 38, 0xf5faf3, 0x90aeb6, 0x7a9caa);
  polygon(appliances, [513,171,541,157,572,172,545,186], 0x293f52);
  polygon(appliances, [521,170,540,161,562,172,543,181], 0x79decb);
  polygon(appliances, [545,234,623,274,623,291,545,253], 0xe4eef0);
  polygon(appliances, [551,241,616,274,616,282,551,249], 0x213f59);
  for (let i = 0; i < 4; i++) {
    appliances.fillStyle([0x46b6be,0xef7a92,0xf6d05f,0x262f44][i])
      .fillCircle(625 + i * 7, 294 + i * 0, 3);
  }
  // Output sheet stacked on printer.
  polygon(appliances, [637,270,668,255,696,269,665,286], C.white);
  polygon(appliances, [644,269,657,262,678,273,666,279], 0xe78980);

  // Paper cutter / finishing table on left-front side.
  isoBox(appliances, 388, 299, 115, 74, 43, 0x77b3aa, 0x2d6c70, 0x4c8d82);
  polygon(appliances, [359,296,391,279,421,294,388,311], 0xf1eee0);
  appliances.lineStyle(4, 0x2b5260).lineBetween(369, 285, 408, 304);
  // Shelving and ready-to-collect parcels.
  isoBox(appliances, 687, 348, 134, 70, 70, 0xe7bf85, 0x926c53, 0x9f7756);
  isoBox(appliances, 677, 325, 46, 35, 18, 0xf3cf9c, 0xcba176, 0xb78c5f);
  isoBox(appliances, 723, 334, 48, 33, 15, 0xecc58d, 0xa77958, 0xbd9165);
  polygon(appliances, [672,306,680,301,687,306,679,312], C.white);
  // Reception counter with polished wood top and monitor.
  isoBox(appliances, 242, 310, 204, 89, 53, C.woodTop, C.woodSide, 0xb17a49);
  isoBox(appliances, 246, 265, 57, 30, 9, 0x2c4d5b, 0x143240, 0x254b58);
  polygon(appliances, [232,255,251,245,271,255,252,264], 0x73d1cb);
  isoBox(appliances, 245, 289, 44, 24, 4, 0xf8f8ec, 0xc2c4b9, 0xced9c9);
  // Business cards on counter.
  for (let i = 0; i < 3; i++) {
    polygon(appliances, [178+i*11,302+i*6,200+i*11,290+i*6,215+i*11,298+i*6,194+i*11,309+i*6], 
      [0xefa77e,0x4ba5ac,0xf5e7c8][i]);
  }
  appliances.fillStyle(0x31565a,0.17).fillEllipse(455,477,60,15);
  isoBox(appliances, 450, 416, 52, 31, 6, C.white, 0xd5dcd4, 0xbecbc3);
  polygon(appliances, [435,415,448,408,461,415,448,421], 0xee998c);

  // Room branding and floating small world labels.
  text(scene, 448, 77, 'P R I N T   R U S H', 25, '#2b6066');
  text(scene, 442, 98, 'TALLER DE ARTES GRÁFICAS', 10, '#5e8b8a');
  text(scene, 242, 374, 'MOSTRADOR', 13, '#fdf9ee');
  text(scene, 571, 345, 'IMPRESIÓN DIGITAL', 11, '#235268');
  text(scene, 685, 439, 'RECOGIDAS', 12, '#f9faed');
  text(scene, 390, 363, 'ACABADOS', 10, '#245b61');

  // Tiny operator and animated customers.
  const worker = pixelHuman(scene, 468, 312, 0x55b6ac, 0xf0be91, 0x50423b);
  const clerk = pixelHuman(scene, 240, 294, 0x2e6c78, 0xd69b75, 0x26394a);
  const customer = pixelHuman(scene, 465, 478, 0xdb7880, 0xf0b88b, 0x58463e);
  const browsing = pixelHuman(scene, 371, 413, 0xf2ac60, 0xe6ad85, 0x383c51);
  scene.tweens.add({ targets: worker, x: 484, duration: 1950, yoyo: true, repeat: -1, ease:'Sine.inOut' });
  scene.tweens.add({ targets: browsing, y: 408, duration: 1000, yoyo: true, repeat: -1, ease:'Sine.inOut' });
  scene.tweens.add({ targets: clerk, y: 291, duration: 1200, yoyo: true, repeat: -1 });
  scene.tweens.add({ targets: customer, x: 280, y: 398, duration: 2400, ease:'Sine.easeInOut' });

  const printerIndicator = scene.add.circle(613, 247, 8, 0x7ff5ce).setStrokeStyle(2, 0x1d6871);
  scene.tweens.add({ targets: printerIndicator, alpha: 0.55, duration: 750, yoyo: true, repeat: -1 });

  // Always-visible hint labels, styled like in-world HUD signs.
  const sign = (x:number,y:number,label:string,color:number) => {
    const t=scene.add.text(x,y,label,{fontFamily:'monospace',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#224a5a',padding:{x:10,y:7}}).setOrigin(0.5).setDepth(15);
    const line=scene.add.graphics().setDepth(14);
    line.lineStyle(2,color,0.8).lineBetween(x,y+16,x,y+37);
    return t;
  };
  sign(218,408,'① ENCARGOS',0xf4b76c);
  sign(574,150,'② PRODUCIR',0x61c6c1);
  sign(730,486,'③ ENTREGAR',0xe4a377);

  return {
    printerIndicator, customer, worker,
    makeFinishedParcel: () => {
      const p=scene.add.rectangle(691,346,20,11,0xf9e7c8).setDepth(11).setAngle(-25);
      scene.tweens.add({ targets:p, y:340, duration:390, yoyo:true, hold:500, onComplete:()=>p.destroy() });
    },
    printPaper: () => {
      const p=scene.add.rectangle(636,268,21,13,0xfbf9ea).setDepth(11).setAngle(25);
      scene.tweens.add({targets:p,x:661,y:283,alpha:0.25,duration:680,onComplete:()=>p.destroy()});
    }
  };
}
