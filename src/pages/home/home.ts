import {Component} from '@angular/core';
import {CountyInfo} from '../../providers/county-info';
import {Location, PhoneLocation} from '../../providers/phone-location';
import {
  AlertController, LoadingController, ModalController, NavController, Platform, ToastController
} from 'ionic-angular';
import {IntroPage} from '../../pages/intro-page/intro-page';
import {SetupPage} from '../../pages/setup/setup';
import {Storage} from '@ionic/storage';
import {LangChangeEvent, TranslateService} from 'ng2-translate';
import {PortlandMetroInfo} from '../../providers/portland-metro-info';
import {ForestInfo, ForestRegion} from '../../providers/forest-info';
import {OfflineContent} from '../../providers/offline-content';

@Component({
  templateUrl: 'home.html'
})
export class HomePage {

  cards:any[];
  countyNames:string[];
  hasInit:boolean;
  loading:any;
  myCounty:string;
  myWage:number;
  myWageSource:string;
  seeMore:boolean;
  manualSelect:boolean;
  myLat:number;
  myLong:number;
  online:boolean;
  local:any;
  lang:string;
  hidePullTab:boolean;

  // only called once.
  constructor(public alertCtrl:AlertController, public forestInfo:ForestInfo, public offlineContent:OfflineContent, public modalCtrl:ModalController, public platform:Platform, public portlandMetroInfo:PortlandMetroInfo, public navCtrl:NavController, public loadingCtrl:LoadingController, public translate:TranslateService, private toastCtrl:ToastController, public countyInfo:CountyInfo, public phoneLocation:PhoneLocation) {
    this.hasInit = false;
    this.cards = [];
    this.countyNames = [];
    this.manualSelect = false;
    this.myWageSource = 'County';
    this.seeMore = false;
    this.myLat = 0;
    this.myLong = 0;
    this.hidePullTab = false;
    this.loading = this.loadingCtrl.create({
      content: 'Loading content for your location...'
    });
  }

  ionViewDidLoad() {
    //read the active lang
    this.lang = this.translate.currentLang;
    // however it may not have been set quite yet so also subscribe.
    this.translate.onLangChange.subscribe((event:LangChangeEvent) => {
      this.lang = event.lang;
    });
  }


  ionViewDidEnter() {
    this.platform.ready().then(() => {

      this.manualSelect = true;

      if (!this.local) {
        this.local = new Storage();

        //this.local.clear();
      }

      // TODO bring this thing here all of the time.
      this.hidePullTab = false;

      this.local.get('isSetup')
        .then((value)=> {
          // It doesn't appear to be a problem to set this property up at this time.
          // bad smell however.
          if (!value) {
            this.navCtrl.push(SetupPage, {fromHome: true});
          } else {


            this.doInit();
            this.loading.present();

            // in the case we are loading for the first time.  Bring up a modal.
            this.local.get('loadedBefore')
              .then((loadedBefore)=> {
                if (!loadedBefore) {
                  let introModal = this.modalCtrl.create(IntroPage);
                  introModal.present();
                }
                this.local.set('loadedBefore', true);
              });

            this.offlineContent.init()
              .then(()=> {
                this.offlineContent.getLatestVersion();
              });
          }
        })
        .catch(()=> {
          console.error('unexpected state reading isSetup');
        });
    });
  }

  countyChange() {
    let info = this.countyInfo.getInformationForCounty(this.myCounty);
    this.manualSelect = true;
    if (info) {
      this.myWage = info.wage;
      this.myWageSource = 'Condado';
      if (this.translate.currentLang === 'en') {
        this.myWageSource = 'County';
      }
    }
  }


  doRefresh(refresher) {
    this.hidePullTab = true;
    // load location info-


    // everytime we load populate the position content.
    this.populatePositionContent()
      .then(()=> {

        this.portlandMetroInfo.init()
          .then(()=> {
            this.portlandMetroInfo.isInMetro()
              .then((locationMetro) => {
                if (locationMetro) {
                  this.myWageSource = 'Portland Metro';
                  this.myWage = this.portlandMetroInfo.getWage();
                }

                if (refresher) {
                  refresher.complete();
                }
              });
            this.forestInfo.init()
              .then(()=> {
                this.forestInfo.getForestPhoneIsIn()
                  .then((forest:ForestRegion)=> {
                    if (forest) {
                      let toast = this.toastCtrl.create({
                        message: `You have entered forest ${forest.name}`,
                        duration: 12000,
                        showCloseButton: true,
                        position: 'bottom',
                        cssClass: 'app-toast'
                      });
                      toast.present();
                    }
                  });
              });
          });
      })
      .catch((err)=> {
        // this is nominal if the user does not supply location services.
        if (refresher) {
          refresher.complete();
        }
      });
  }


  doInit() {

    this.manualSelect = false;
    this.countyInfo.init()
      .then(()=> {
        if (this.countyNames.length === 0) {
          this.countyNames = this.countyInfo.getListOfCounties();
          this.countyNames.sort();
        }
        this.hasInit = true;
        this.loading.dismiss();

      })
      .catch((err)=> {
        console.error(err);
        this.hasInit = true;
        this.loading.dismiss();
      });
  }

  populateCards() {
    if (this.cards.length > 0) {
      return;
    }

    this.translate.get('OVERVIEW-TITLE').subscribe((title:string) => {
      this.translate.get('OVERVIEW').subscribe((res:string) => {
        if (this.lang === 'aa') {
          this.cards.push({audio: 'assets/audio/mixteco/overview.m4a', content: res, title: title});

        } else {
          this.cards.push({content: res, title: title});
        }
      });
    });
    this.translate.get('MIN-WAGE-EXAMPLE-TITLE').subscribe((title:string) => {
      this.translate.get('MIN-WAGE-EXAMPLE').subscribe((res:string) => {
        this.cards.push({
          content: res,
          title: title
        });
      });
    });
    this.translate.get('URBAN-TITLE').subscribe((title:string) => {
      this.translate.get('URBAN').subscribe((res:string) => {

        if (this.lang === 'aa') {
          this.cards.push({audio: 'assets/audio/mixteco/urban.m4a', content: res, title: title});
        } else {
          this.cards.push({content: res, title: title});
        }
      });
    });
    this.translate.get('BYCOUNTY-TITLE').subscribe((title:string) => {
      this.translate.get('BYCOUNTY').subscribe((res:string) => {


        if (this.lang === 'en') {
          this.cards.push({
            content: res,
            title: title,
            showContent: true,
            img: 'https://firebasestorage.googleapis.com/v0/b/paystumped.appspot.com/o/map_english.png?alt=media&token=dacc1891-a71d-4c71-a812-5314d566106c'
          });

        } else {
          this.cards.push({
            content: res,
            title: title,
            showContent: true,
            img: 'https://firebasestorage.googleapis.com/v0/b/paystumped.appspot.com/o/map_spanish.png?alt=media&token=83a021ae-9507-484e-97a6-b43d4887b698'
          });

        }
      });
    });


    this.translate.get('WAGE-TABLE-TITLE').subscribe((title:string) => {
      this.translate.get('WAGE-TABLE').subscribe((res:string) => {
        this.cards.push({
          content: res,
          title: title
        });
      });
    });


    this.translate.get('GOOGLE-TITLE').subscribe((title:string) => {
      this.translate.get('GOOGLE').subscribe((res:string) => {
        this.cards.push({
          content: res,
          title: title
        });
      });
    });


    this.translate.get('FOREST-WORK-TITLE').subscribe((title:string) => {
      this.translate.get('FOREST-WORK').subscribe((res:string) => {
        this.cards.push({
          content: res,
          title: title,
        });
      });
    });

    this.translate.get('OVERVIEW2-TITLE').subscribe((title:string) => {
      this.translate.get('OVERVIEW2').subscribe((res:string) => {

        if (this.lang === 'aa') {
          this.cards.push({audio: 'assets/audio/mixteco/overview2.m4a', content: res, title: title});
        } else {
          this.cards.push({content: res, title: title});
        }
      });
    });
    this.translate.get('OVERVIEW3-TITLE').subscribe((title:string) => {
      this.translate.get('OVERVIEW3').subscribe((res:string) => {

        if (this.lang === 'aa') {
          this.cards.push({audio: 'assets/audio/mixteco/overview3.m4a', content: res, title: title});
        } else {
          this.cards.push({content: res, title: title});
        }
      });
    });
    this.translate.get('OVERVIEW4-TITLE').subscribe((title:string) => {
      this.translate.get('OVERVIEW4').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
    this.translate.get('EXEMPTION-1-TITLE').subscribe((title:string) => {
      this.translate.get('EXEMPTION-1').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
    this.translate.get('EXEMPTION-2-TITLE').subscribe((title:string) => {
      this.translate.get('EXEMPTION-2').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
    this.translate.get('AG-EXEMPTION-1-TITLE').subscribe((title:string) => {
      this.translate.get('AG-EXEMPTION-1').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
    this.translate.get('AG-EXEMPTION-2-TITLE').subscribe((title:string) => {
      this.translate.get('AG-EXEMPTION-2').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
    this.translate.get('DISCLAIMER-TITLE').subscribe((title:string) => {
      this.translate.get('DISCLAIMER').subscribe((res:string) => {
        this.cards.push({content: res, title: title});
      });
    });
  }

  populatePositionContent() {
    return new Promise((resolve, reject)=> {
      this.phoneLocation.getLocation()
        .then((me:Location)=> {

          // typing toFixed is string so casting to number.
          this.myLat = +me.latitude.toFixed(5);
          this.myLong = +me.longitude.toFixed(5);
          this.manualSelect = false;
          let info = this.countyInfo.getInformationForLocation(me);
          if (info) {
            this.myCounty = info.county;

            if ((info.wage > this.myWage) || this.manualSelect) {
              this.myWage = info.wage;
              this.myWageSource = 'Condado';
              if (this.translate.currentLang === 'en') {
                this.myWageSource = 'County';
              }
            }
          } else {
            let alert = this.alertCtrl.create({
              title: 'Out of Area',
              subTitle: 'Your phone is not in an area the app supports',
              buttons: ['OK']
            });
            alert.present();
          }
          resolve();
        })
        .catch(()=> {
          let alert = this.alertCtrl.create({
            title: 'Location not Found',
            subTitle: 'Your location cannot be found at this time',
            buttons: ['OK']
          });
          alert.present();
          this.myLat = 0;
          this.myLong = 0;
          this.myCounty = '';
          this.myWage = 0.0;
          this.manualSelect = true;
          this.myWageSource = 'Condado';
          if (this.translate.currentLang === 'en') {
            this.myWageSource = 'County';
          }
          reject();

        })
        .catch(reject);
    });
  }

}
