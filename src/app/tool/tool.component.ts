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

  private canvasSize = 64;
  private interval;
  private isIntervalRunning = false;
  private sign = {
    label: 'xd',
    snaps: []
  };

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
    const offset = this.getOffset(canvas);

    down$.subscribe(() => {
      this.toogleSnapsGathering(true);
    });

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

  makeSnap(): void {
    const { nativeElement } = this.elRef;
    const canvas = nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const pixelArray = [];
    for (let x = 0; x < this.canvasSize; x++) {
      pixelArray.push([]);
      for (let y = 0; y < this.canvasSize; y++) {
        if (this.isBlack(canvas.getContext('2d').getImageData(x, y, 1, 1).data)) {
          pixelArray[x].push(1);
        } else {
          pixelArray[x].push(0);
        }
      }
    }
    this.sign.snaps.push(pixelArray);
  }

  saveSign(): void {
    this.toogleSnapsGathering(false);
    console.log(this.sign);
  }

  isBlack(pixel): boolean {
    return pixel[3] > 0 && pixel[0] === pixel[1] && pixel[1] === pixel[2] && pixel[2] === 0;
  }

  toogleSnapsGathering(turnOn: boolean): void {
    if (turnOn && !this.isIntervalRunning) {
      this.interval = setInterval(() => {
        this.makeSnap();
      }, 500);
      this.isIntervalRunning = true;
    }
    if (!turnOn) {
      clearInterval(this.interval);
      this.isIntervalRunning = false;
    }
  }

}
