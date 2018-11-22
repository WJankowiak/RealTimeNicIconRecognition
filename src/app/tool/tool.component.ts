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
  private currentSnap = [];

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
      this.toggleSnapsGathering(true);
    });

    paints$.subscribe((event) => {
      const clientX = event.clientX - offset.left;
      const clientY = event.clientY - offset.top;
      this.addPointToCurrentSnap(Math.floor(clientX), Math.floor(clientY));
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
    this.sign.label = this.activeSign.label;
    if (this.currentSnap.length > 0) {
      this.sign.snaps.push(this.currentSnap);
      this.clearCurrentSnap();
    }
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
    this.toggleSnapsGathering(false);
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

  addPointToCurrentSnap(x: number, y: number): void {
    this.currentSnap.push({x: x, y: y});
  }

  clearCurrentSnap(): void {
    this.currentSnap = [];
  }

  refresh(): void {
    this.toggleSnapsGathering(false);
    this.sign = {
      label: '',
      snaps: []
    };
    this.initSign();
    this.paintService.clear();
    this.savingErrorOccur = false;
  }

  toggleSnapsGathering(turnOn: boolean): void {
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
