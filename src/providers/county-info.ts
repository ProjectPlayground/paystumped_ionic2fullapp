import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {Location} from './phone-location';


export class MinWageSchedule {

  constructor(private schedule:any[]) {

  }

  getWageForTime(time:number) {
    for (let entry of this.schedule) {
      if (time >= entry.epoch) {
        return entry.minWage;
      }
    }
    //perhaps I should throw an error.
    return null;
  }
}

export class CountyCategoryLUT {
  catMap:Map<string,string>;
  catSchedule:Map<string,MinWageSchedule>;

  constructor(private catList:any[]) {
    this.catMap = new Map<string,string>();
    this.catSchedule = new Map<string,MinWageSchedule>();

    // build map.
    for (let entry of catList) {
      this.catMap.set(entry.county, entry.category);
    }
  }

  getCategory(county:string) {
    return this.catMap.get(county);
  }

  getMinWage(county:string) {
    return this.getMinWageForCategory(this.getCategory(county));
  }

  getMinWageForCategory(cat:string) {
    let now = Date.now();
    return this.catSchedule.get(cat).getWageForTime(now);
  }

  addMinWageSchedule(category:string, wageSchedule:MinWageSchedule) {
    this.catSchedule.set(category, wageSchedule);
  }
}

export interface PolyPlace {
  name:string;
  poly:Location[];
}

export class County implements PolyPlace {
  constructor(public name:string, public poly:Location[]) {

  }
}

export class InfoForLocation {
  county:string;
  wage:number;

}

@Injectable()
export class CountyInfo {

  private hasInit:boolean;
  private rawCountyLocations:any;
  private rawCountyCategories:any;
  private rawCategoryWageSchedule:any;
  private counties:County[];
  public infoLUT:CountyCategoryLUT;

  constructor(private http:Http) {

    this.counties = [];
    this.hasInit = false;

  }


  getInformationForCounty(countyName:string) {
    let info = new InfoForLocation();
    info.county = countyName;
    info.wage = this.infoLUT.getMinWage(countyName);
    return info;

  }

  getInformationForLocation(me) {


    for (let county of this.counties) {

      let inside = this.isPointInPolygon(me, county);
      if (inside) {
        let info = new InfoForLocation();

        info.county = county.name;
        info.wage = this.infoLUT.getMinWage(county.name);
        return info;
      }
    }
  }

  getListOfCounties():string[] {
    let res = [];

    for (let entry of this.counties) {
      res.push(entry.name);
    }

    return res;
  }

  init() {
    // this is probably not the correc way..
    return new Promise((resolveOuter, rejectOuter) => {

      if (this.hasInit) {
        resolveOuter();
        return;
      }

      let p1 = new Promise((resolve, reject)=> {
        this.http.get('assets/json/or-counties.geojson')
          .map(res => res.json())
          .subscribe(data => this.rawCountyLocations = data.features,
            (err) => {
              console.error(err);
              reject(err);
            },
            () => {
              // put magic here to refactor the json data into our local data.
              for (let entry of this.rawCountyLocations) {
                let countyName = entry.properties.NAME;
                let theList = [];

                for (let item of entry.geometry.coordinates[0]) {
                  theList.push(new Location(item[1], item[0]));
                }

                this.counties.push(new County(countyName, theList));
              }
              resolve();
            });

      });
      let p2 = new Promise((resolve, reject)=> {
        this.http.get('assets/json/county-category.json')
          .map(res => res.json())
          .subscribe(data => this.rawCountyCategories = data,
            (err) => {
              console.error(err);
              reject(err);
            },
            () => {

              // initialize the look up.
              this.infoLUT = new CountyCategoryLUT(this.rawCountyCategories);

              // populate the min wage info for the county.
              this.http.get('assets/json/category-wage.json')
                .map(res => res.json())
                .subscribe(data => this.rawCategoryWageSchedule = data,
                  (err) => {
                    console.error(err);
                    reject(err);
                  },
                  () => {

                    for (let entry of this.rawCategoryWageSchedule) {
                      this.infoLUT.addMinWageSchedule(entry.category, new MinWageSchedule(entry.wages));
                    }
                    resolve();
                  });

            });
      });

      Promise.all([p1, p2]).then(()=> {
        this.hasInit = true;
        resolveOuter();
      })
        .catch((err)=> rejectOuter(err));

    });

  }


  isPointInPolygon(point:Location, polyPlace:PolyPlace) {
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    let x = point.latitude, y = point.longitude;

    let inside = false;
    for (let i = 0, j = polyPlace.poly.length - 1; i < polyPlace.poly.length; j = i++) {
      let xi = polyPlace.poly[i].latitude, yi = polyPlace.poly[i].longitude;
      let xj = polyPlace.poly[j].latitude, yj = polyPlace.poly[j].longitude;

      let intersect = ((yi > y) !== (yj > y))
        && (x < (((xj - xi) * (y - yi) / (yj - yi) ) + xi));
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
}
