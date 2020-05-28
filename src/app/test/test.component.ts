import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Quagga from 'quagga';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit {
  @ViewChild('kek') kek: ElementRef;
  value: any;

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    Quagga.onDetected( (result) => {
      console.log('Barcode detected and processed : [' + result.codeResult.code + ']', result);
    });

    Quagga.onProcessed( (result) => {
      const drawingCtx = Quagga.canvas.ctx.overlay;
      const drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width'), 10), parseInt(drawingCanvas.getAttribute('height'), 10));
          result.boxes.filter( (box) => {
            return box !== result.box;
          }).forEach( (box) => {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
          });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
        }
      }
    });

    Quagga.onDetected((result) => {
      if (result.codeResult.code){
        this.value = result.codeResult.code;
        Quagga.stop();
        // setTimeout(function(){ $('#livestream_scanner').modal('hide'); }, 1000);
      }
    });

  }

  stop() {
    Quagga.stop();
  }

  start() {
    Quagga.init({
      inputStream : {
        name : 'Live',
        type : 'LiveStream',
        constraints: {
          width: {min: 320, max: 320},
          height: {min: 320, max: 320},
          aspectRatio: {min: 1, max: 100},
          facingMode: 'environment' // or "user" for the front camera
        },
        target: this.kek.nativeElement
      },
      locator: {
        patchSize: 'medium',
        halfSample: true
      },
      numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
      decoder: {
        readers: [
          {format: 'ean_reader', config: {}}
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Initialization finished. Ready to start');
      Quagga.start();
    });


  }
}
