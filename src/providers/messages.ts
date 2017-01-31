import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {Subject}    from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

import {Storage} from '@ionic/storage';
import {Platform} from 'ionic-angular';

export class AppPushNotification {

  constructor(public titleEn:string, public titleEs:string, public bodyEn:string, public bodyEs:string, public date:number) {

  }
}

@Injectable()
export class Messages {
  private numMessagesSource = new Subject<number>();
  items:FirebaseListObservable<any>;
  public newMessages:number;
  public messages:AppPushNotification[];
  local:Storage;


  public currentNumberOfMessages$:Observable<number> = this.numMessagesSource.asObservable();

  constructor(public http:Http, public af:AngularFire, public platform:Platform) {
    this.platform.ready().then(() => {
      this.items = af.database.list('/msg');
      this.messages = [];
      this.newMessages = 0;
      this.local = new Storage();


      this.local.get('storedMessages')
        .then((locallyStoredMessages)=> {

          if (locallyStoredMessages) {
            this.messages = locallyStoredMessages;
          }


          this.items.subscribe((allChildren)=> {
            for (let child of allChildren) {

              af.database.object('/msg/' + child.$key).subscribe((m)=> {

                let found:boolean = false;
                for (let refElement of this.messages) {
                  if (m.tEn === refElement.titleEn) {
                    found = true;
                  }
                }
                if (!found) {
                  this.setNumberOfMessages(this.newMessages + 1);
                  this.messages.push(new AppPushNotification(m.tEn, m.tEs, m.bEn, m.bEs, m.d));
                }

                // sort in reverse chronological.
                this.messages = this.messages.sort((e1, e2) => {
                  if (e1.date < e2.date) {
                    return 1;
                  }

                  if (e1.date > e2.date) {
                    return -1;
                  }

                  return 0;
                });

                this.local.set('storedMessages', this.messages);


              }, (errI)=> {
                throw errI;
              });
            }

          }, (err)=> {
            console.error(err);
          });


        });
    });

  }

  sendMessage(email:string, message:string) {
    this.af.database.list('/userMsgs').push({
      user: email,
      msg: message
    });
  }

  setNumberOfMessages(value:number) {

    this.newMessages = value;
    this.numMessagesSource.next(value);
  }

  getCopyOfMessages() {
    if (this.messages) {
      return this.messages.slice();
    } else {
      return [];
    }
  }


}
