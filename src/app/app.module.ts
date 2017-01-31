import {NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Http} from '@angular/http';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {IntroPage} from '../pages/intro-page/intro-page';
import {SetupPage} from '../pages/setup/setup';
import {MessageCard} from '../pages/message-card/message-card';
import {MapContentPage} from '../pages/map-content/map-content';
import {PushedMessagesPage} from '../pages/pushed-messages/pushed-messages';
import {InfoCard} from '../pages/info-card/info-card';
import {AboutPage} from '../pages/about/about';
import {CalculatorPage} from '../pages/calculator/calculator';
import {CountyInfo} from '../providers/county-info';
import {LastKnownNetworkState} from '../providers/last-known-network-state';
import {LocalNotes} from '../providers/local-notes';
import {MapExplorerPage} from '../pages/map-explorer/map-explorer';
import {Messages}   from '../providers/messages';
import {NotesPage} from '../pages/notes/notes';
import {PhoneLocation} from '../providers/phone-location';
import {ForestInfo} from '../providers/forest-info';
import {OfflineContent} from '../providers/offline-content';
import {PortlandMetroInfo} from '../providers/portland-metro-info';
import {Storage} from '@ionic/storage';
import {AgmCoreModule, GoogleMapsAPIWrapper} from 'angular2-google-maps/core';

import {TranslateModule} from 'ng2-translate/ng2-translate';
import {TranslateLoader, TranslateStaticLoader} from 'ng2-translate/src/translate.service';

// Import the AF2 Module
import {AngularFireModule, AuthProviders, AuthMethods} from 'angularfire2';
import {MomentModule} from 'angular2-moment';

// AF2 Settings
export const firebaseConfig = {
  apiKey: 'YOUR_KEY',
  authDomain: 'YOURAPP.firebaseapp.com',
  databaseURL: 'https://YOURAPP.firebaseio.com',
  storageBucket: 'gs://YOURAPP.appspot.com'
};

const myFirebaseAuthConfig = {
  provider: AuthProviders.Anonymous,
  method: AuthMethods.Anonymous
};


export function translateLoaderFactory(http:any) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}


/* for AgmCoreModule we can specify the libraries */
@NgModule({
  declarations: [
    AboutPage,
    InfoCard,
    MyApp,
    CalculatorPage,
    HomePage,
    IntroPage,
    MapContentPage,
    MapExplorerPage,
    MessageCard,
    NotesPage,
    PushedMessagesPage,
    SetupPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateLoaderFactory,
      deps: [Http]
    }),
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    }),
    AngularFireModule.initializeApp(firebaseConfig, myFirebaseAuthConfig),
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AboutPage,
    InfoCard,
    MyApp,
    CalculatorPage,
    HomePage,
    IntroPage,
    MapContentPage,
    MapExplorerPage,
    MessageCard,
    NotesPage,
    PushedMessagesPage,
    SetupPage
  ],
  providers: [CountyInfo, ForestInfo, OfflineContent, LastKnownNetworkState, LocalNotes, Messages, PhoneLocation, PortlandMetroInfo, Storage, GoogleMapsAPIWrapper, {
    provide: ErrorHandler,
    useClass: IonicErrorHandler
  }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
