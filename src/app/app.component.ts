import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';

import {AboutPage} from '../pages/about/about';
import {HomePage} from '../pages/home/home';
import {CalculatorPage} from '../pages/calculator/calculator';
import {PushedMessagesPage} from '../pages/pushed-messages/pushed-messages';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {SetupPage} from '../pages/setup/setup';
import {Messages} from '../providers/messages';
import {NotesPage} from '../pages/notes/notes';
import {Storage} from '@ionic/storage';
import {LastKnownNetworkState} from '../providers/last-known-network-state';
import {MapExplorerPage} from '../pages/map-explorer/map-explorer';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav:Nav;
  rootPage = HomePage;
  pages:any[];
  unReadMessages:number;

  constructor(platform:Platform, lastKnownNetworkState:LastKnownNetworkState, translate:TranslateService, public messageService:Messages) {


    platform.ready().then(() => {

      // included here so that the
      lastKnownNetworkState.init();

      // put this processing here because all pages are recreated each time we navigate to them.
      let local = new Storage();

      local.get('language')
        .then((lang) => {
          if (lang) {
            translate.use(lang);
          } else {
            translate.use('en');
          }
        })
        .catch(()=> {
          translate.setDefaultLang('en');
        });


      // subscribe to update the badge.
      messageService.currentNumberOfMessages$.subscribe(
        (currentNumber) => {
          this.unReadMessages = currentNumber;
        }
      );


      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    this.unReadMessages = 0;

    // used for an example of ngFor and navigation
    this.pages = [HomePage, CalculatorPage, PushedMessagesPage, MapExplorerPage, NotesPage, SetupPage, AboutPage];

  }

  openPage(page) {
    this.nav.setRoot(page);
  }
}
