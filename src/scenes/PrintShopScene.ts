import Phaser from 'phaser';
import { buildShopArt, type ShopArt } from './ShopArt';

type OrderState = 'queued' | 'printing' | 'ready';
type Order = {
  id: number;
  customer: string;
  product: string;
  state: OrderState;
};

const CLIENTS = ['Aina', 'Marc', 'Lola', 'Nora', 'Álex', 'Sofía', 'Joan', 'Irene'];
const PRODUCTS = [
  '200 tarjetas de visita',
  '500 folletos A5',
  '50 carteles A3',
  '150 invitaciones',
  '100 etiquetas adhesivas',
];

export class PrintShopScene extends Phaser.Scene {
  private orders: Order[] = [];
  private nextId = 1001;
  private delivered = 0;
  private busy = false;
  private art?: ShopArt;
  private clockMinutes = 9 * 60;
  private infoText?: Phaser.GameObjects.Text;

  constructor() { super('PrintShopScene'); }

  create(): void {
    this.art = buildShopArt(this);
    this.createHotspot(244, 292, 182, 138, () => this.receiveOrder(), 'MOSTRADOR');
    this.createHotspot(576, 241, 183, 156, () => this.printOrder(), 'IMPRESORA');
    this.createHotspot(688, 373, 136, 130, () => this.deliverOrder(), 'RECOGIDAS');

    this.infoText = this.add.text(28, 548, 'PULSA UNA ZONA DE LA IMPRENTA PARA INTERACTUAR', {
      fontSize: '12px', color: '#24515e', fontFamily: 'monospace', fontStyle: 'bold'
    }).setDepth(16);

    this.setStatus('¡Buenos días!', 'El taller está preparado. Pulsa el mostrador para recibir el primer encargo.');
    this.refresh();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.clockMinutes += 2;
        this.refreshClock();
      }
    });
  }

  private createHotspot(
    x: number, y: number, width: number, height: number, action: () => void,
    label: string
  ): void {
    const zone = this.add.zone(x, y, width, height).setDepth(12);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerdown', action);
    zone.on('pointerover', () => {
      this.infoText?.setText('HACER CLIC · ' + label);
      this.infoText?.setColor('#118c90');
    });
    zone.on('pointerout', () => {
      this.infoText?.setText('PULSA UNA ZONA DE LA IMPRENTA PARA INTERACTUAR');
      this.infoText?.setColor('#24515e');
    });
  }

  private receiveOrder(): void {
    const id = this.nextId++;
    const customer = CLIENTS[(id - 1001) % CLIENTS.length];
    const product = PRODUCTS[(id - 1001) % PRODUCTS.length];
    this.orders.push({ id, customer, product, state: 'queued' });
    this.setStatus('Nuevo encargo #' + id,
      customer + ' ha solicitado ' + product + '. Ya está registrado y pendiente de imprimir.');
    this.showToast('+' + product, '#4c918d');
    this.refresh();
  }

  private printOrder(): void {
    if (this.busy) {
      this.setStatus('Impresora ocupada', 'La máquina está terminando un trabajo. Comprueba los encargos pendientes.');
      return;
    }
    const order = this.orders.find(item => item.state === 'queued');
    if (!order) {
      this.setStatus('Sin trabajos en cola', 'Recibe primero un encargo en el mostrador.');
      return;
    }
    order.state = 'printing';
    this.busy = true;
    this.setStatus('Imprimiendo #' + order.id,
      'La impresora digital está fabricando ' + order.product + '. Puedes seguir atendiendo clientes.');
    this.refresh();
    this.add.tween({
      targets: this.art?.printerIndicator,
      scale: 1.65,
      yoyo: true,
      repeat: 9,
      duration: 240
    });
    for (let i = 1; i <= 4; i++) {
      this.time.delayedCall(i * 800, () => this.art?.printPaper());
    }
    this.time.delayedCall(4200, () => {
      order.state = 'ready';
      this.busy = false;
      this.art?.printerIndicator.setScale(1);
      this.art?.makeFinishedParcel();
      this.setStatus('Encargo #' + order.id + ' terminado',
        '¡El pedido de ' + order.customer + ' está listo! Ya puede pasar a recogidas.');
      this.showToast('PEDIDO TERMINADO', '#43a69d');
      this.refresh();
    });
  }

  private deliverOrder(): void {
    const order = this.orders.find(item => item.state === 'ready');
    if (!order) {
      this.setStatus('Estantería de recogidas', 'Todavía no hay ningún encargo terminado para entregar.');
      return;
    }
    this.orders.splice(this.orders.indexOf(order), 1);
    this.delivered++;
    this.setStatus('¡Entrega realizada!',
      order.customer + ' ha recogido el pedido #' + order.id + '. Se ha completado el ciclo.');
    this.showToast('ENTREGADO · #' + order.id, '#d68e67');
    this.refresh();
  }

  private showToast(message: string, color: string): void {
    const toast = this.add.text(450, 525, message, {
      fontFamily: 'monospace', fontSize: '15px', fontStyle: 'bold',
      color: '#ffffff', backgroundColor: color, padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setDepth(19);
    this.tweens.add({
      targets: toast, y: 490, alpha: 0, duration: 1500, ease: 'Sine.easeOut',
      onComplete: () => toast.destroy()
    });
  }

  private refreshClock(): void {
    const clock = document.getElementById('clock');
    const minutes = this.clockMinutes % (24 * 60);
    if (clock) clock.textContent =
      String(Math.floor(minutes / 60)).padStart(2, '0') + ':' +
      String(minutes % 60).padStart(2, '0');
  }

  private refresh(): void {
    const delivered = document.getElementById('delivered');
    const queued = document.getElementById('queued');
    const ready = document.getElementById('ready');
    const list = document.getElementById('order-list');
    if (delivered) delivered.textContent = String(this.delivered);
    if (queued) queued.textContent = String(this.orders.filter(o => o.state === 'queued').length);
    if (ready) ready.textContent = String(this.orders.filter(o => o.state === 'ready').length);
    if (list) {
      list.replaceChildren();
      if (this.orders.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'order-empty';
        empty.textContent = 'No hay encargos activos.';
        list.append(empty);
      }
      for (const order of this.orders.slice(-5).reverse()) {
        const row = document.createElement('div');
        row.className = 'order-row';
        const state = document.createElement('span');
        state.className = 'order-state state-' + order.state;
        state.textContent = order.state === 'queued' ? 'PENDIENTE' :
          order.state === 'printing' ? 'IMPRIMIENDO' : 'LISTO';
        const info = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = '#' + order.id + ' · ' + order.customer;
        const desc = document.createElement('small');
        desc.textContent = order.product;
        info.append(name, desc);
        row.append(info, state);
        list.append(row);
      }
    }
  }

  private setStatus(title: string, message: string): void {
    const status = document.getElementById('status');
    const detail = document.getElementById('message');
    if (status) status.textContent = title;
    if (detail) detail.textContent = message;
  }
}
