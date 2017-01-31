import {Component} from '@angular/core';
import {LocalNotes, NoteEntry} from '../../providers/local-notes';
import {NavController, AlertController, LoadingController} from 'ionic-angular';
import * as moment from 'moment';

import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-notes',
  templateUrl: 'notes.html'
})
export class NotesPage {
  notes:NoteEntry[];
  rows:number;
  loading:any;

  constructor(public localNotes:LocalNotes, public loadingCtrl:LoadingController, public navCtrl:NavController, public translate:TranslateService, public alertCtrl:AlertController) {
    this.notes = [];
    this.loading = this.loadingCtrl.create({
      content: 'Loading your notes...'
    });
  }

  ionViewWillEnter() {
    this.loading.present();
    this.localNotes.getNotes()
      .then((localNotes:NoteEntry[])=> {
        setTimeout(()=> {
          if (localNotes) {
            this.notes = localNotes;


          } else {
            this.notes = [];
          }
          this.loading.dismiss();
        });
      })
      .catch((err)=> {
        console.error(err);
        this.loading.dismiss();
        this.notes = [];
      });

  }

  ionViewDidLeave() {

    this.localNotes.setNotes(this.notes);
  }

  add() {


    if (this.translate.currentLang === 'en') {

      let prompt = this.alertCtrl.create({
        title: 'Note Text',
        message: 'Enter any note you like',
        inputs: [
          {
            name: 'text',
            placeholder: ''
          },
        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Save',
            handler: data => {
              if (this.notes.length > 0) {
                this.notes.unshift(new NoteEntry(data.text, Date.now()));
              } else {
                this.notes.push(new NoteEntry(data.text, Date.now()));
              }
            }
          }
        ]
      });
      prompt.present();
    } else {

      let prompt = this.alertCtrl.create({
        title: 'Texto de la nota',
        message: 'Introduce cualquier nota que quieras',
        inputs: [
          {
            name: 'text',
            placeholder: ''
          },
        ],
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Salvar',
            handler: data => {
              if (this.notes.length > 0) {
                this.notes.unshift(new NoteEntry(data.text, Date.now()));
              } else {
                this.notes.push(new NoteEntry(data.text, Date.now()));
              }
            }
          }
        ]
      });
      prompt.present();
    }


  }

  delete(item) {
    let i = 0;
    while (i < this.notes.length) {
      if (this.notes[i].date === item.date) {
        this.notes.splice(i, 1);
        break;
      }
      i++;
    }
  }

  view(item) {

    let alert = this.alertCtrl.create({
      title: 'Note Entry',
      subTitle: moment(item.date).format('LLLL'),
      message: item.text,
      buttons: ['Dismiss']
    });
    alert.present();

  }

}
