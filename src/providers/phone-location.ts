import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Geolocation} from 'ionic-native';

import {Platform} from 'ionic-angular';

export class Location {
  constructor(public latitude?:number,
              public longitude?:number) {
  }
}

@Injectable()
export class PhoneLocation {

  timedOut:boolean;
  lastValue:Location;

  constructor(public platform:Platform) {
    this.timedOut = true;

  }

  getLocation() {
    return new Promise((resolve, reject)=> {
      this.platform.ready().then(() => {


        // only need to ask the phone up to every 20 seconds.
        if (!this.timedOut) {
          resolve(this.lastValue);
        }
        else {

          // timeout in 20 seconds invalidating the local reading.
          setTimeout(()=> {
            this.timedOut = true;
          }, 20000);

          Geolocation.getCurrentPosition({timeout: 20000, enableHighAccuracy: false})
            .then((position) => {
              this.lastValue = new Location(position.coords.latitude, position.coords.longitude);
              this.timedOut = false;
              resolve(this.lastValue);
              return;
            })
            .catch(reject);
        }

      });
    });
  }

}
