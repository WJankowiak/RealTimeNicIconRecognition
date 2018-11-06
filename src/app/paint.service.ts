import { Injectable } from '@angular/core';

let infiniteX = Infinity;
let infiniteY = Infinity;

@Injectable({
  providedIn: 'root'
})
export class PaintService {

  private canvas: HTMLCanvasElement = null;
  private ctx: CanvasRenderingContext2D;
  private canvasSize = 320;

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
    if (Math.abs(infiniteX - clientX) < 320 && Math.abs(infiniteY - clientY) < 320) {
      this.ctx.moveTo(infiniteX, infiniteY);
    }
    this.ctx.lineTo(clientX, clientY);
    this.ctx.stroke();
    this.ctx.closePath();
    infiniteX = clientX;
    infiniteY = clientY;
  }

  refresh(): void {
    infiniteX = infiniteY = Infinity;
  }
}
