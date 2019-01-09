import {Component, ElementRef, OnInit} from '@angular/core';
import {PaintService} from '../paint.service';
import {fromEvent} from 'rxjs';
import {mergeMap, takeUntil} from 'rxjs/operators';
import {RestService} from '../rest.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

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
  public predictedSign = {
    label: null,
    img: null,
    probabilityArray: null
  };
  public predictErrorOccur = false;
  private currentSnap = [];

  constructor(private restService: RestService, private paintService: PaintService, private elRef: ElementRef) { }

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
    const touchMove$ = fromEvent<TouchEvent>(canvas, 'touchmove');
    const touchStart$ = fromEvent<TouchEvent>(canvas, 'touchstart');
    const touchEnd$ = fromEvent<TouchEvent>(canvas, 'touchend');
    const touchPaint$ = touchStart$.pipe(
      mergeMap(start => touchMove$.pipe(takeUntil(touchEnd$)))
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

    touchStart$.subscribe(() => {
      this.toggleSnapsGathering(true);
    });

    touchPaint$.subscribe((event) => {
      const clientX = event.touches[0].clientX - offset.left;
      const clientY = event.touches[0].clientY - offset.top;
      this.addPointToCurrentSnap(Math.floor(clientX), Math.floor(clientY));
      this.paintService.paint({ clientX, clientY });
    });

    touchEnd$.subscribe(() => {
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
    if (this.currentSnap.length > 0) {
      this.sign.snaps.push(this.currentSnap);
      this.clearCurrentSnap();
      this.predictSign();
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
    this.paintService.clear();
    this.predictErrorOccur = false;
    this.predictedSign.label = null;
    this.predictedSign.img = null;
    this.predictedSign.probabilityArray = null;
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

  predictSign(snaps: any = this.sign) {
    this.restService.predictSign(snaps).subscribe(
    data => {
        console.log(data);
        // @ts-ignore
        this.bindPredictedSign(data.result);
      },
      error => {
        console.log(error);
        this.predictErrorOccur = true;
      }
    );
  }

  bindPredictedSign(predictResult: number[]) {
    const indexOfPredictedSign = predictResult.indexOf(Math.max(...predictResult));
    this.predictedSign.label = this.signMap[indexOfPredictedSign].label;
    this.predictedSign.img = this.signMap[indexOfPredictedSign].img;
    this.predictedSign.probabilityArray = [];
    for (let i = 0; i < predictResult.length; i++) {
      this.predictedSign.probabilityArray.push({
        sign: this.signMap[i].label,
        probability: predictResult[i].toFixed(4)
      });
    }
  }

}
