import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from 'ng2-translate/ng2-translate';

import {OfflineContent} from '../../providers/offline-content';

@Component({
  templateUrl: 'setup.html'
})
export class SetupPage {
  language:string;
  complete:boolean;
  currentBuild:string;
  hasNewerSoftware:boolean;
  loading:any;

  constructor(public alertCtrl:AlertController, public loadingCtrl:LoadingController, public navParam:NavParams, public navCtrl:NavController, public offlineContent:OfflineContent, public translate:TranslateService) {
    this.language = null;
    this.complete = false;
    this.currentBuild = '0.0.1';
    this.hasNewerSoftware = false;


    this.loading = this.loadingCtrl.create({
      content: 'Loading content for your location...'
    });
  }


  ionViewDidLoad() {
    this.offlineContent.getLatestVersion().then((verLatest:string) => {
      if (this.offlineContent.hasNewerVersion()) {
        this.hasNewerSoftware = true;
      }
    });
  }

  completeSetup() {

    if (this.language) {

      if (this.language.includes('native')) {

        let alert = this.alertCtrl.create({
          title: 'Unsupported Language',
          subTitle: 'Currently there is no support for this language, we need to figure out language of the copy!',
          buttons: ['OK']
        });
        alert.present();
        return;
      } else {
        let local = new Storage();
        local.set('language', this.language)
          .catch(()=> console.error('error when setting language'));
        this.translate.use(this.language);

        if (this.navParam.get('fromHome')) {
          local.set('isSetup', 'true')
            .catch(()=> console.error('error when setting isSetup'));
          this.navCtrl.popToRoot();
        } else {
          // show the positive acknoledgement that we have changed the setup.
          this.complete = true;
        }

      }
    } else {

      let alert = this.alertCtrl.create({
        title: 'Not Done Yet!',
        subTitle: 'Select a language to complete your setup!',
        buttons: ['OK']
      });
      alert.present();
    }

  }

  updateLocalData() {
    this.loading.present();
    this.offlineContent.updateOfflineContent()
      .then(()=> {
        this.hasNewerSoftware = false;

        this.offlineContent.getLatestVersion().then((verLatest:string) => {
          this.currentBuild = verLatest;
          this.loading.dismiss();
        });
      })
      .catch(()=> {

        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: 'We cannot update your data at this time.',
          buttons: ['OK']
        });
        alert.present();
        this.loading.dismiss();

      });
  }

}
