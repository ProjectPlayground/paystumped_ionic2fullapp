import {Component} from '@angular/core';
import {Platform, AlertController} from 'ionic-angular';
import {AppPushNotification, Messages} from '../../providers/messages';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-pushed-messages',
  templateUrl: 'pushed-messages.html'
})
export class PushedMessagesPage {
  messages:any[];
  lang:string;

  showThankyou:boolean;

  constructor(public alertCtrl:AlertController, public messageService:Messages, public platform:Platform, public translate:TranslateService) {
    this.messages = [];
    this.showThankyou = false;
  }

  ionViewDidLoad() {
    this.showThankyou = false;
    this.platform.ready().then(() => {
      this.lang = this.translate.currentLang;


      this.populateMessages(this.messageService.newMessages);
      this.messageService.setNumberOfMessages(0);


      this.messageService.currentNumberOfMessages$.subscribe(
        (currentNumber) => {
          setTimeout(()=> {
            if (currentNumber > 0) {
              this.populateMessages(currentNumber);
              this.messageService.setNumberOfMessages(0);
            }
          }, 10);

        });

    });
  }

  populateMessages(numUnread) {
    let m:AppPushNotification[] = this.messageService.getCopyOfMessages();
    this.messages = [];

    for (let elem of m) {
      if (this.lang === 'en') {
        this.messages.push({readCount: numUnread, title: elem.titleEn, body: elem.bodyEn, date: new Date(elem.date)});
      } else {
        this.messages.push({readCount: numUnread, title: elem.titleEs, body: elem.bodyEs, date: new Date(elem.date)});
      }
      numUnread--;
    }
  }

  sendMessage() {

    if (this.translate.currentLang === 'en') {

      let disclaimerPrompt = this.alertCtrl.create({
        title: 'Disclaimer',
        message: 'The message you are about to send will NOT be read by an attorney who can evaluate your case. This App is for educational purposes only and does not serve as legal advice as to your individual case. By sending this message you are NOT creating an attorney-client relationship. Please contact an attorney if you have questions about your individual case.',
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Send',
            handler: dontCareData => {
              let prompt = this.alertCtrl.create({
                title: 'Contact us',
                message: 'What would you like us to know?',
                inputs: [
                  {
                    name: 'email',
                    placeholder: 'Your email address'
                  },
                  {
                    name: 'msg',
                    placeholder: 'Your message'
                  }
                ],
                buttons: [
                  {
                    text: 'Cancel'
                  },
                  {
                    text: 'Send',
                    handler: data => {

                      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                      if (re.test(data.email)) {
                        this.messageService.sendMessage(data.email, data.msg);
                        this.showThankyou = true;
                      } else {
                        let alert = this.alertCtrl.create({
                          title: 'Bad Email!',
                          subTitle: 'Please enter a valid email address',
                          buttons: ['OK']
                        });
                        alert.present();
                      }
                    }
                  }
                ]
              });
              prompt.present();
            }
          }
        ]
      });
      disclaimerPrompt.present();
    } else {

      let disclaimerPrompt = this.alertCtrl.create({
        title: 'Renuncia',
        message: 'El mensaje que va a mandar NO sera leido por un abogado que puede evaluar su caso. Esta aplicación es para el propósito de educación no más y no es un consejo legal tocante a su caso individual. Por mandar este mensaje, NO estás haciendo una relación entre abogado y cliente. Por favor contacte a un abogado si tiene preguntas sobre su caso individual.',
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Enviar',
            handler: dontCareData => {
              let prompt = this.alertCtrl.create({
                title: 'Contáctenos',
                message: '¿Qué quieres que sepamos?',
                inputs: [
                  {
                    name: 'email',
                    placeholder: 'Tu correo electrónico'
                  },
                  {
                    name: 'msg',
                    placeholder: 'Tu mensaje'
                  }
                ],
                buttons: [
                  {
                    text: 'Cancelar'
                  },
                  {
                    text: 'Enviar',
                    handler: data => {
                      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                      if (re.test(data.email)) {

                        this.messageService.sendMessage(data.email, data.msg);
                        this.showThankyou = true;
                      } else {
                        let alert = this.alertCtrl.create({
                          title: 'Mal correo electrónico!',
                          subTitle: 'Por favor, introduce una dirección de correo electrónico válida',
                          buttons: ['okey']
                        });
                        alert.present();
                      }
                    }
                  }
                ]
              });
              prompt.present();
            }
          }
        ]
      });
      disclaimerPrompt.present();

    }
  }

}
