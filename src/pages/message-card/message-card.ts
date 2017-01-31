import {Component,
  trigger,
  state,
  style,
  transition,
  animate} from '@angular/core';

@Component({
  selector: 'page-message-card',
  templateUrl: 'message-card.html',
  inputs: ['content', 'date', 'readCount', 'title'],
  animations: [
    trigger('clickEffectState', [
      state('inactive', style({
        backgroundColor:  'white',
        transform: 'scale(1)'
      })),
      state('active',   style({
        backgroundColor: '#fcfdff',
        transform: 'scale(1.05)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class MessageCard {
  content:string;
  date:Date;
  readCount:number;
  title:string;
  expanded:boolean;
  toggle:string;

  constructor() {
    this.expanded = false;

    this.toggle = 'inactive';
  }

  click() {
    if(this.toggle === 'inactive') {
      this.toggle = 'active';
    } else {
      this.toggle = 'inactive';
    }
    this.readCount = 0;
    this.expanded = !this.expanded;
  }

}
