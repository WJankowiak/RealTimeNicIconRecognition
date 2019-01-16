import { Injectable } from '@angular/core';

let infiniteX = Infinity;
let infiniteY = Infinity;

@Injectable({
  providedIn: 'root'
})
export class PaintService {

  private canvas: HTMLCanvasElement = null;
  private ctx: CanvasRenderingContext2D;
  private canvasSize = 128;

  // left: 37, up: 38, right: 39, down: 40,
  // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  private scrollKeys = {37: 1, 38: 1, 39: 1, 40: 1};

  initialize(mountPoint: HTMLElement) {
    this.canvas = mountPoint.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.height = this.canvasSize;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 4;
  }

  paint({ clientX, clientY }) {
    this.ctx.beginPath();
    if (Math.abs(infiniteX - clientX) < this.canvasSize && Math.abs(infiniteY - clientY) < this.canvasSize) {
      this.ctx.moveTo(infiniteX, infiniteY);
    }
    this.ctx.lineTo(clientX, clientY);
    this.ctx.stroke();
    this.ctx.closePath();
    infiniteX = clientX;
    infiniteY = clientY;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
  }

  refresh(): void {
    infiniteX = infiniteY = Infinity;
  }

  customPreventDefault(e) {
    e = e || window.event;
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.returnValue = false;
  }

  preventDefaultForScrollKeys(e) {
    if (this.scrollKeys[e.keyCode]) {
      this.customPreventDefault(e);
      return false;
    }
  }

  disableScroll() {
    if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', this.customPreventDefault, false);
    }
    window.onwheel = this.customPreventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = this.customPreventDefault; // older browsers, IE
    window.ontouchmove  = this.customPreventDefault; // mobile
    document.onkeydown  = this.preventDefaultForScrollKeys;
  }

  enableScroll() {
    if (window.removeEventListener) {
      window.removeEventListener('DOMMouseScroll', this.customPreventDefault, false);
    }
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
  }
}
