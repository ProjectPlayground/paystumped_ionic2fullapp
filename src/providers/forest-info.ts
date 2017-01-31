import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {CountyInfo, PolyPlace} from './county-info';
import {Location, PhoneLocation} from './phone-location';
import {OfflineContent} from './offline-content';

export class ForestRegion implements PolyPlace {
  constructor(public name:string, public poly:Location[]) {

  }
}

@Injectable()
export class ForestInfo {

  raw:any;
  forests:ForestRegion[];
  hasInit:boolean;

  constructor(public http:Http, public countyInfo:CountyInfo, public offlineContent:OfflineContent, public phoneLocation:PhoneLocation) {
    this.forests = [];
    this.hasInit = false;
  }

  init() {
    return new Promise((resolve, reject) => {

      if (this.hasInit) {
        resolve();
        return;
      }

      this.offlineContent.init()
        .then(()=> {

          this.raw = this.offlineContent.getForestJson();

          for (let feature of this.raw.features) {

            let theList = [];

            for (let item of feature.geometry.coordinates[0]) {
              theList.push(new Location(item[1], item[0]));
            }
            this.forests.push(new ForestRegion(feature.properties.name, theList));
          }
          this.hasInit = true;
          resolve();
        });
    });
  }

  getForestPhoneIsIn() {
    return new Promise((resolve, reject)=> {
      this.phoneLocation.getLocation()
        .then((location)=> {
          let element:ForestRegion = null;
          for (let reg of this.forests) {
            if (this.countyInfo.isPointInPolygon(location, reg)) {
              element = reg;
              break;
            }
          }
          resolve(element);
        })
        .catch((err)=> {
          reject(err);
        });
    });
  }


  getForestWages() {
    // does this need to be guarded with init?
    return this.offlineContent.getForetWageJson();
  }

}
