import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {CountyInfo, PolyPlace} from './county-info';
import {Location, PhoneLocation} from './phone-location';
import {OfflineContent} from './offline-content';

export class MetroRegion implements PolyPlace {
  constructor(public name:string, public poly:Location[]) {

  }
}

@Injectable()
export class PortlandMetroInfo {
  rawMetro:any;
  regions:MetroRegion[];
  hasInit:boolean;

  constructor(public http:Http, public countyInfo:CountyInfo, public offlineContent:OfflineContent, public phoneLocation:PhoneLocation) {
    this.regions = [];
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
          this.rawMetro = this.offlineContent.getPortlandMetroJson();

          for (let feature of this.rawMetro.features) {
            let theList = [];

            for (let item of feature.geometry.coordinates[0]) {
              theList.push(new Location(item[1], item[0]));
            }
            this.regions.push(new MetroRegion(feature.properties.name, theList));
          }
          this.hasInit = true;
          resolve();

        });
    });
  }

  getWage():number {
    return this.countyInfo.infoLUT.getMinWageForCategory('PORTLAND');

  }

  isInMetro() {
    return new Promise((resolve, reject)=> {
      this.phoneLocation.getLocation()
        .then((location)=> {
          let isIn:boolean = false;
          for (let reg of this.regions) {
            isIn = this.countyInfo.isPointInPolygon(location, reg);
            if (isIn) {
              break;
            }
          }
          resolve(isIn);
        })
        .catch((err)=> {
          reject(err);
        });
    });
  }
}