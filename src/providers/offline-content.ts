import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

import {AngularFire} from 'angularfire2';
import {Http} from '@angular/http';
import {ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';


export class AppOfflineContentURL {
  constructor(public forest:string, public fwage:string, public portland:string, public wage:string, public $key:string) {

  }
}

@Injectable()
export class OfflineContent {

  latestVersion:string;
  currentVersion:string;
  dbSub:any;
  local:any;

  easterJson:any;
  forestJson:any;
  forestWagesJson:any;
  mapJson:any;
  portlandJson:any;
  hasInit:boolean;


  constructor(public af:AngularFire, public http:Http, public toastCtrl:ToastController) {
    this.currentVersion = '0.0.1';
    this.latestVersion = '0.0.1';
    this.dbSub = null;
    this.local = new Storage();
    this.hasInit = false;

    this.forestJson = null;
    this.forestWagesJson = null;
    this.mapJson = null;
    this.portlandJson = null;


  }

  init() {
    return new Promise((resolveOuter, rejectOuter)=> {
      if (this.hasInit) {
        resolveOuter();
        return;
      } else {

        this.local.get('currentVersion')
          .then((ver)=> {
            // a string.
            if (ver) {
              this.currentVersion = ver;
            }
          });


        // pull content from local storage if available, -or- get content from app build area.

        let p1 = new Promise((resolve, reject)=> {
          this.local.get('wageJSON')
            .then((wage)=> {
              if (!wage) {

                this.http.get('assets/json/wage_map.geojson')
                  .map(res => res.json())
                  .subscribe(data => this.mapJson = data,
                    (err) => {
                      reject(err);
                    }, ()=> {
                      resolve();
                    });
              } else {
                this.mapJson = wage;
                resolve();
              }

            })
            .catch((err)=> {
              reject(err);
            });
        });
        let p2 = new Promise((resolve, reject)=> {
          this.local.get('forestJSON')
            .then((forest)=> {

              if (!forest) {
                this.http.get('assets/json/or_forests.geojson')
                  .map(res => res.json())
                  .subscribe(data => this.forestJson = data,
                    (err) => {
                      reject(err);
                    }, ()=> {
                      resolve();
                    });
              } else {
                this.forestJson = forest;
                resolve();
              }

            })
            .catch((err)=> {
              reject(err);
            });
        });
        let p3 = new Promise((resolve, reject)=> {
          this.local.get('portlandJSON')
            .then((pdx)=> {

              if (!pdx) {
                this.http.get('assets/json/portland_metro.geojson')
                  .map(res => res.json())
                  .subscribe(data => this.portlandJson = data,
                    (err) => {
                      reject(err);
                    }, ()=> {
                      resolve();
                    });
              } else {
                this.portlandJson = pdx;
                resolve();
              }

            })
            .catch((err)=> {
              reject(err);
            });
        });
        let p4 = new Promise((resolve, reject)=> {
          this.local.get('fwageJSON')
            .then((fwage)=> {

              if (!fwage) {
                this.http.get('assets/json/forest_rates.json')
                  .map(res => res.json())
                  .subscribe(data => this.forestWagesJson = data,
                    (err) => {
                      reject(err);
                    }, ()=> {
                      resolve();
                    });
              } else {
                this.forestWagesJson = fwage;
                resolve();
              }

            })
            .catch((err)=> {
              reject(err);
            });
        });

        let p5 = new Promise((resolve, reject)=> {

          this.http.get('assets/json/easteregg.geojson')
            .map(res => res.json())
            .subscribe(data => this.easterJson = data,
              (err) => {
                reject(err);
              }, ()=> {
                resolve();
              });

        });
        Promise.all([p1, p2, p3, p4, p5]).then(() => {
          this.hasInit = true;
          resolveOuter();
        }).catch((err)=> {
          rejectOuter(err);
        });
      }
    });
  }

  getCurrentVersion() {
    return new Promise((resolve)=> {
      resolve(this.currentVersion);
    });
  }


  hasNewerVersion():boolean {


    let currentA = this.currentVersion.split('.');
    let latestA = this.latestVersion.split('.');

    let currentSum = Number(currentA[0]) * 1000 + Number(currentA[1]) * 100 + Number(currentA[2]);
    let latestSum = Number(latestA[0]) * 1000 + Number(latestA[1]) * 100 + Number(latestA[2]);

    if (latestSum > currentSum) {

      return true;
    }
    return false;
  }

  getLatestVersion() {
    return new Promise((resolve)=> {

      if (this.dbSub) {
        resolve(this.latestVersion);
      } else {
        this.dbSub = this.af.database.object('/latestVersion').subscribe((m)=> {
          // firebase doesn't allow '.' so I put for the version '_'
          this.latestVersion = m.$value.replace(/_/g, '.');

          if (this.hasNewerVersion()) {
            let toast = this.toastCtrl.create({
              message: `You can update to version ${this.latestVersion} under Setup`,
              duration: 4000,
              showCloseButton: true,
              position: 'bottom',
              cssClass: 'app-toast'
            });
            toast.present();

          }


          resolve(this.latestVersion);
        }, (err)=> {
          // die silently.
          console.error('could not read latest version');
          resolve(this.currentVersion);
        });
      }
    });
  }


  getForestJson() {
    return this.forestJson;

  }

  getEasterEggJson() {
    return this.easterJson;
  }

  getForetWageJson() {
    return this.forestWagesJson;
  }

  getPortlandMetroJson() {
    return this.portlandJson;
  }

  getWageMapJson() {
    return this.mapJson;
  }

  updateOfflineContent() {

    let verSub:any = null;
    return new Promise((resolveOuter, rejectOuter)=> {

      let firebaseVersion = this.latestVersion.replace(/\./g, '_');

      verSub = this.af.database.object('/version/' + firebaseVersion).subscribe((versionContent:AppOfflineContentURL)=> {

        verSub.unsubscribe();

        let p1 = new Promise((resolve, reject)=> {
          this.http.get(versionContent.wage)
            .map(res => res.json()).subscribe(data => {
            resolve(data);
          }, (err)=> {
            reject(err);
          });
        });
        let p2 = new Promise((resolve, reject)=> {
          this.http.get(versionContent.forest)
            .map(res => res.json()).subscribe(data => {
            resolve(data);
          }, (err)=> {
            reject(err);
          });
        });
        let p3 = new Promise((resolve, reject)=> {
          this.http.get(versionContent.portland)
            .map(res => res.json()).subscribe(data => {
            resolve(data);
          }, (err)=> {
            reject(err);
          });
        });

        let p4 = new Promise((resolve, reject)=> {
          this.http.get(versionContent.fwage)
            .map(res => res.json()).subscribe(data => {
            resolve(data);
          }, (err)=> {
            reject(err);
          });
        });


        Promise.all([p1, p2, p3, p4]).then((values:any[]) => {

          this.local.set('wageJSON', values[0]);
          this.local.set('forestJSON', values[1]);
          this.local.set('portlandJSON', values[2]);
          this.local.set('fwageJSON', values[3]);
          this.local.set('currentVersion', this.latestVersion);

          this.mapJson = values[0];
          this.forestJson = values[1];
          this.portlandJson = values[2];
          this.forestWagesJson = values[3];
          this.currentVersion = this.latestVersion;
          resolveOuter(this.currentVersion);
        }).catch((err)=> {
          rejectOuter(err);
        });


      }, (err)=> {
        verSub.unsubscribe();
        rejectOuter(err);
      });
    });

  }

}
