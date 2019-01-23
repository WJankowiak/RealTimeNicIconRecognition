import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signs',
  templateUrl: './signs.component.html',
  styleUrls: ['./signs.component.scss']
})
export class SignsComponent implements OnInit {

  public signs = [
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

  constructor() { }

  ngOnInit() {
  }

}
