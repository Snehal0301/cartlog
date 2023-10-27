import { Component } from '@angular/core';

@Component({
  selector: 'app-giftcard',
  templateUrl: './giftcard.component.html',
  styleUrls: ['./giftcard.component.scss'],
})
export class GiftcardComponent {
  tabState: number = 1;
  error:boolean = false;

  enteredAmount: any;
  enteredChip: any;
  constructor() {

  }

  handleFunc(type: string, value: any) {
    if (type === 'tab') {
      this.tabState = value || 1;
    } else if (type === 'chip') {
      this.enteredAmount = 0;
      this.enteredChip = value
    }else if(type === 'buyAmount'){
      if (value < 100 || value > 10000) {
        this.error = true;
      }
      this.enteredChip = 0;
    }
  }
}
