import Phaser from 'phaser';

type OrderState = 'queued' | 'printing' | 'ready';
type Order = { id: number; customer: string; product: string; state: OrderState };

const CLIENTS = ['Lola', 'Marc', 'Nora', 'Álex', 'Aina', 'Sofía'];
const PRODUCTS = ['200 tarjetas de visita', '500 folletos A5', '50 carteles A3'];

/** Proof-of-concept scene; all artwork is deliberately provisional. */
export class PrintShopScene extends Phaser.Scene {
  private orders: Order[] = [];
  private nextId = 1001;
  private delivered = 0;
  private busy = false;
  private machineLight?: Phaser.GameObjects.Arc;

  constructor() { super('PrintShopScene'); }

  create(): void {
    this.drawFloor();
    this.createStation(240, 290, 0xd49b65, 'MOSTRADOR', () => this.receiveOrder());
    this.createStation(580, 205, 0x34768b, 'IMPRESORA', () => this.printOrder());
    this.createStation(665, 370, 0x9cba96, 'RECOGIDAS', () => this.deliverOrder());
    this.createVisitor();
    this.setStatus('Imprenta abierta', 'Pulsa el mostrador para registrar tu primer encargo.');
    this.refresh();
  }

  private drawFloor(): void {
    const g = this.add.graphics();
    g.fillStyle(0xc2d8d4);
    g.fillPoints([
      new Phaser.Math.Vector2(450, 80), new Phaser.Math.Vector2(820, 265),
      new Phaser.Math.Vector2(450, 460), new Phaser.Math.Vector2(80, 265)
    ], true);
    g.lineStyle(2, 0x8baea9, 0.48);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      g.lineBetween(450 - 370 * t, 80 + 185 * t, 820 - 370 * t, 265 + 195 * t);
      g.lineBetween(450 + 370 * t, 80 + 185 * t, 80 + 370 * t, 265 + 195 * t);
    }
    g.fillStyle(0x638585);
    g.fillPoints([
      new Phaser.Math.Vector2(80, 265), new Phaser.Math.Vector2(450, 460),
      new Phaser.Math.Vector2(450, 488), new Phaser.Math.Vector2(80, 292)
    ], true);
    g.fillStyle(0x496c76);
    g.fillPoints([
      new Phaser.Math.Vector2(450, 460), new Phaser.Math.Vector2(820, 265),
      new Phaser.Math.Vector2(820, 292), new Phaser.Math.Vector2(450, 488)
    ], true);
    this.add.text(450, 45, 'LA PRIMERA IMPRENTA', {
      color: '#1f5262', fontSize: '24px', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createStation(x: number, y: number, color: number, label: string, action: () => void): void {
    const g = this.add.graphics();
    const dark = Phaser.Display.Color.IntegerToColor(color).darken(25).color;
    const darker = Phaser.Display.Color.IntegerToColor(color).darken(42).color;
    g.fillStyle(color).fillPoints([
      { x: -65, y: -9 }, { x: 0, y: -42 },
      { x: 65, y: -9 }, new Phaser.Math.Vector2(0, 25)
    ], true);
    g.fillStyle(dark).fillPoints([
      { x: -65, y: -9 }, new Phaser.Math.Vector2(0, 25),
      new Phaser.Math.Vector2(0, 53), { x: -65, y: 19 }
    ], true);
    g.fillStyle(darker).fillPoints([
      new Phaser.Math.Vector2(0, 25), { x: 65, y: -9 },
      new Phaser.Math.Vector2(65, 19), new Phaser.Math.Vector2(0, 53)
    ], true);
    const sign = this.add.text(0, 57, label, {
      color: '#173b47', backgroundColor: '#ffffffdd',
      padding: new Phaser.Math.Vector2(8, 5), fontSize: '14px',
      fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    const station = this.add.container(x, y, [g, sign])
      .setSize(150, 120).setInteractive({ useHandCursor: true });
    station.on('pointerdown', action);
    station.on('pointerover', () => station.setScale(1.035));
    station.on('pointerout', () => station.setScale(1));
    if (label === 'IMPRESORA') this.machineLight = this.add.circle(x, y - 26, 6, 0x90f1d5);
  }

  private createVisitor(): void {
    const shadow = this.add.ellipse(0, 21, 34, 11, 0x31585c, 0.22);
    const body = this.add.rectangle(0, 0, 20, 32, 0xd8747b);
    const face = this.add.circle(0, -23, 13, 0xf1bd93);
    const hair = this.add.arc(0, -27, 13, 180, 340, false, 0x5c493e);
    const visitor = this.add.container(135, 330, [shadow, body, face, hair]);
    this.tweens.add({
      targets: visitor, x: 164, duration: 1400,
      yoyo: true, repeat: -1, ease: 'Sine.inOut'
    });
  }

  private receiveOrder(): void {
    const id = this.nextId++;
    const customer = CLIENTS[id % CLIENTS.length];
    const product = PRODUCTS[id % PRODUCTS.length];
    this.orders.push({ id, customer, product, state: 'queued' });
    this.setStatus('Pedido #' + id + ' aceptado',
      customer + ' solicita ' + product + '. Se añade a la cola de impresión.');
    this.refresh();
  }

  private printOrder(): void {
    if (this.busy) {
      this.setStatus('Impresora ocupada', 'Termina el trabajo actual antes de comenzar otro.');
      return;
    }
    const order = this.orders.find(item => item.state === 'queued');
    if (!order) {
      this.setStatus('Sin pedidos pendientes', 'Registra un pedido en el mostrador.');
      return;
    }
    order.state = 'printing';
    this.busy = true;
    this.setStatus('Imprimiendo #' + order.id,
      'La máquina está trabajando en ' + order.product + '.');
    this.refresh();
    this.tweens.add({
      targets: this.machineLight, alpha: 0.25,
      yoyo: true, repeat: 7, duration: 250
    });
    this.time.delayedCall(4000, () => {
      order.state = 'ready';
      this.busy = false;
      this.machineLight?.setAlpha(1);
      this.setStatus('Pedido #' + order.id + ' listo',
        'Está en la zona de recogidas. Pulsa la estantería para entregarlo.');
      this.refresh();
    });
  }

  private deliverOrder(): void {
    const order = this.orders.find(item => item.state === 'ready');
    if (!order) {
      this.setStatus('Sin pedidos listos', 'Los trabajos impresos aparecerán aquí para su entrega.');
      return;
    }
    this.orders.splice(this.orders.indexOf(order), 1);
    this.delivered++;
    this.setStatus('Pedido #' + order.id + ' entregado',
      order.customer + ' recoge ' + order.product + '. ¡Ciclo completado!');
    this.refresh();
  }

  private refresh(): void {
    const delivered = document.getElementById('delivered');
    const queued = document.getElementById('queued');
    if (delivered) delivered.textContent = String(this.delivered);
    if (queued) queued.textContent = String(this.orders.length);
  }

  private setStatus(title: string, message: string): void {
    const status = document.getElementById('status');
    const detail = document.getElementById('message');
    if (status) status.textContent = title;
    if (detail) detail.textContent = message;
  }
}
