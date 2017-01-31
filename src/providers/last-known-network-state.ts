import {Injectable} from '@angular/core';
import {Network} from 'ionic-native';



@Injectable()
export class LastKnownNetworkState {
  online:boolean;

  constructor() {
    this.online = navigator.onLine;
  }

  init() {

    //  this will capture changes in network state while the app is running.
    // I called this after device ready.  Although I am not sure that was necessary.
    Network.onDisconnect().subscribe(() => {
      this.online = false;
    });
    Network.onConnect().subscribe(() => {
      this.online = true;
    });

  }

  isOnline():boolean {
    return this.online;
  }

}
