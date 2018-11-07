import {Component, ElementRef, OnInit} from '@angular/core';
import {PaintService} from '../paint.service';
import {fromEvent} from 'rxjs';
import {mergeMap, takeUntil} from 'rxjs/operators';
import {RestService} from '../rest.service';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class ToolComponent implements OnInit {

  private canvasSize = 128;
  private interval;
  private isIntervalRunning = false;
  private signMap = [
    {
      label: 'accident',
      img: 'assets/img/accident.png',
    },
    {
      label: 'bomb',
      img: 'assets/img/bomb.png',
    },
    {
      label: 'car',
      img: 'assets/img/car.png',
    },
    {
      label: 'casualty',
      img: 'assets/img/casualty.png',
    },
    {
      label: 'electricity',
      img: 'assets/img/electricity.png',
    },
    {
      label: 'fire',
      img: 'assets/img/fire.png',
    },
    {
      label: 'fire_brigade',
      img: 'assets/img/fire_brigade.png',
    },
    {
      label: 'flood',
      img: 'assets/img/flood.png',
    },
    {
      label: 'gas',
      img: 'assets/img/gas.png',
    },
    {
      label: 'injury',
      img: 'assets/img/injury.png'
    },
    {
      label: 'paramedics',
      img: 'assets/img/paramedics.png',
    },
    {
      label: 'person',
      img: 'assets/img/person.png',
    },
    {
      label: 'police',
      img: 'assets/img/police.png',
    },
    {
      label: 'roadblock',
      img: 'assets/img/road_block.png',
    }
  ];
  private sign = {
    label: '',
    snaps: []
  };
  public activeSign = null;
  private activeSignIndex = -1;
  public loading = false;
  public savingErrorOccur = false;

  constructor(private restService: RestService, private paintService: PaintService, private elRef: ElementRef) { }

  ngOnInit() {
    this.paintService.initialize(this.elRef.nativeElement);
    this.initSign();
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
    this.sign.label = this.activeSign.label;
    this.sign.snaps.push(pixelArray);
  }

  initSign(): void {
    if (this.activeSignIndex < 0 || this.activeSignIndex >= this.signMap.length - 1) {
      this.activeSign = this.signMap[0];
      this.activeSignIndex = 0;
    } else {
      this.activeSignIndex++;
      this.activeSign = this.signMap[this.activeSignIndex];
    }
  }

  saveSign(): void {
    this.toogleSnapsGathering(false);
    if (this.sign.snaps.length > 0) {
      this.loading = true;
      this.restService.saveSign(this.sign).subscribe(
        () => {},
        () => {
          this.refresh();
          this.savingErrorOccur = true;
          this.loading = false;
        },
        () => {
          this.refresh();
          this.loading = false;
        }
      );
    }
  }

  refresh(): void {
    this.toogleSnapsGathering(false);
    this.sign = {
      label: '',
      snaps: []
    };
    this.initSign();
    this.paintService.clear();
    this.savingErrorOccur = false;
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
