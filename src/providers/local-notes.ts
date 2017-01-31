import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import {TranslateService} from 'ng2-translate';

export class NoteEntry {
  constructor(public text:string, public date:number) {

  }
}

@Injectable()
export class LocalNotes {
  local:any;

  constructor(public http:Http, public translate:TranslateService) {
    this.local = new Storage();
  }

  getNotes() {
    return new Promise((resolve, reject)=> {

      this.local.get('beenHere')
        .then((isFirstLoad)=> {

          if (!isFirstLoad) {
            let notes = [];

            this.translate.get('SLIDE-ME-LEFT').subscribe((val:string) => {
              notes.push(new NoteEntry(val, Date.now()));
            });
            this.local.set('beenHere', true);
            resolve(notes);

          } else {

            this.local.get('userNotes')
              .then((answer)=> {
                resolve(answer);
              })
              .catch((err) => {
                  reject(err);
                }
              );
          }
        });
    });
  }

  setNotes(notes:NoteEntry[]) {
    this.local.set('userNotes', notes);
  }

}
