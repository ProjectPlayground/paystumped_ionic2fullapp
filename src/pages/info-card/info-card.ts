import {
  Component,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import {NativeAudio} from 'ionic-native';
import {MediaPlugin} from 'ionic-native';
import {PhotoViewer} from 'ionic-native';
import {LastKnownNetworkState} from '../../providers/last-known-network-state';
import {AlertController} from 'ionic-angular';

@Component({
  selector: 'page-info-card',
  templateUrl: 'info-card.html',
  inputs: ['audio', 'content', 'showContent', 'title', 'img'],
  animations: [
    trigger('clickEffectState', [
      state('inactive', style({
        backgroundColor: 'white',
        transform: 'scale(1)'
      })),
      state('active', style({
        backgroundColor: '#fcfdff',
        transform: 'scale(1.05)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class InfoCard {
  audio:string;
  audioPlaying:boolean;
  audioLoaded:boolean;
  content:any;
  showContent:boolean;
  title:string;
  img:string;
  clickCount:number;

  file:any;

  toggle:string;

  constructor(public lastKnownNetworkState:LastKnownNetworkState, public alertCtrl:AlertController) {
    this.clickCount = 0;
    this.audioPlaying = false;
    this.audioLoaded = false;

    this.toggle = 'inactive';


  }

  willUnload() {
    // audio files are referenced by an id I configure as the path!
    NativeAudio.unload(this.audio);
  }

  clicked() {
    if (this.toggle === 'inactive') {
      this.toggle = 'active';
    } else {
      this.toggle = 'inactive';
    }

    // if blank
    if (!this.showContent) {
      this.showContent = true;
      this.clickCount = 0;
      if (this.audio) {


        if (!this.audioLoaded) {
          /*
           NativeAudio.preloadComplex(this.audio, this.audio, 1, 1, 0)
           .then(() => {
           this.play();
           this.audioLoaded = true;

           }, (err) => {
           console.error(err);
           });
           */


          this.file = new MediaPlugin(this.audio);
          this.play();

          this.audioLoaded = true;
        } else {
          this.play();
        }

        this.audioPlaying = true;
      }
      return;
    }
    //case where we are open but haven't clicked on an image.

    if (this.clickCount === 0 && this.img) {
      // in the event we are offline we do not want to show the photo as it uses an external link.
      if (this.lastKnownNetworkState.isOnline()) {
        PhotoViewer.show(this.img);
      } else {
        let alert = this.alertCtrl.create({
          title: 'Appear Offline',
          subTitle: 'You appear offline and this image is loaded from the internet',
          buttons: ['Dismiss']
        });
        alert.present();
      }
      ++this.clickCount;
      return;
    }

    // closing
    this.showContent = false;
    this.clickCount = 0;
    if (this.audioPlaying) {
      /*
       NativeAudio.stop(this.audio)
       .then(() => {
       // stopped.
       }, (err)=> {
       console.error(err);
       });
       */
      this.file.stop();
      this.file.release();
      this.audioPlaying = false;
    }

  }

  play() {
    this.file.play();
    /*
     NativeAudio.play(this.audio, ()=> {
     // done.
     }
     ).then(() => {
     // playing.
     }, (err)=> {
     console.error(err);
     });
     */
  }

}
