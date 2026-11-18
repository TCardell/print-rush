import Phaser from 'phaser';
import { PrintShopScene } from './scenes/PrintShopScene';
import './styles.css';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#e9f2ee',
  width: 900,
  height: 590,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { pixelArt: true, antialias: false },
  scene: [PrintShopScene],
});
