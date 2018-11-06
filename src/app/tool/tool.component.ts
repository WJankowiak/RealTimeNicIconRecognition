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

}
