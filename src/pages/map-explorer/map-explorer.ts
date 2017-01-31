import {Component} from '@angular/core';
import {LoadingController, Platform, AlertController} from 'ionic-angular';
import {Location, PhoneLocation} from '../../providers/phone-location';
import {LastKnownNetworkState} from '../../providers/last-known-network-state';

declare var google:any;

@Component({
  selector: 'page-map-explorer',
  templateUrl: 'map-explorer.html'
})
export class MapExplorerPage {
  title:string = 'Oregon Wage Map';
  lat:number = 45.521;
  lng:number = -122.677;
  loading:any;
  mapLoaded:boolean;

  constructor(public alertCtrl:AlertController, public lastKnownNetworkState:LastKnownNetworkState, public loadingCtrl:LoadingController, public phoneLocation:PhoneLocation, public platform:Platform) {

    // default to load map div.
    this.mapLoaded = true;

    this.loading = this.loadingCtrl.create({
      content: 'Loading content for your location...'
    });
  }

  ionViewDidEnter() {

    this.platform.ready().then(() => {
        this.loading.present();
        this.phoneLocation.getLocation()
          .then((me:Location)=> {

            // typing toFixed is string so casting to number.
            this.lat = me.latitude;
            this.lng = me.longitude;

            setTimeout(()=> {
              if ((typeof google === 'object') && (this.lastKnownNetworkState.isOnline())) {
                this.mapLoaded = true;
              } else {
                this.mapLoaded = false;
                // inform user google maps could not be loaded.

                let alert = this.alertCtrl.create({
                  title: 'Map not loaded',
                  message: 'Google maps could not be loaded. Ensure you are online',
                  buttons: ['Dismiss']
                });
                alert.present();
              }
            }, 1000);
            this.loading.dismiss();
          })
          .catch(()=> {
            this.loading.dismiss();
          });
      }
    );


  }


}
