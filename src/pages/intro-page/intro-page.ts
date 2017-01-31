import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';

/*
 Generated class for the IntroPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-intro-page',
  templateUrl: 'intro-page.html'
})
export class IntroPage {

  constructor(public viewCtrl:ViewController) {
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }

}
