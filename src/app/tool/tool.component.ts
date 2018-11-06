import {Component, ElementRef, OnInit} from '@angular/core';
import {PaintService} from '../paint.service';
import {fromEvent} from 'rxjs';
import {mergeMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class ToolComponent implements OnInit {

  private canvasSize = 200;

  constructor(private paintService: PaintService, private elRef: ElementRef) { }

  ngOnInit() {
    this.paintService.initialize(this.elRef.nativeElement);
    this.startPainting();
  }

  private startPainting() {
    const { nativeElement } = this.elRef;
    const canvas = nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const move$ = fromEvent<MouseEvent>(canvas, 'mousemove');
    const down$ = fromEvent<MouseEvent>(canvas, 'mousedown');
    const up$ = fromEvent<MouseEvent>(canvas, 'mouseup');
    const paints$ = down$.pipe(
      mergeMap(down => move$.pipe(takeUntil(up$)))
    );

    down$.subscribe(console.info);

    const offset = this.getOffset(canvas);

    paints$.subscribe((event) => {
      const clientX = event.clientX - offset.left;
      const clientY = event.clientY - offset.top;
      this.paintService.paint({ clientX, clientY });
    });

    up$.subscribe(() => {
      this.paintService.refresh();
    });
  }

  getOffset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();

    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft
    };
  }

  saveCanvas(): void {
    const { nativeElement } = this.elRef;
    const canvas = nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const pixelArray = Array(this.canvasSize).fill(Array(this.canvasSize));
    for (let x = 0; x < this.canvasSize; x++) {
      for (let y = 0; y < this.canvasSize; y++) {
        const pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        this.isBlack(pixel) ? pixelArray[x][y] = 1 : pixelArray[x][y] = 0;
        if (this.isBlack(pixel)) {
          console.log(x, y, pixelArray[x][y]);
        }
      }
    }
  }

  isBlack(pixel): boolean {
    return pixel[3] > 0 && pixel[0] === pixel[1] && pixel[1] === pixel[2] && pixel[2] === 0;
  }

}
