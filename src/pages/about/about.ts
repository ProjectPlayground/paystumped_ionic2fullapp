import {Component} from '@angular/core';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  content:string;

  constructor(public translate:TranslateService) {

    this.translate.get('ABOUT-US-TEXT').subscribe((value:string) => {
      this.content = value;
    });
  }


}
