import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController, AlertController} from 'ionic-angular';


@Component({
  selector: 'page-detailmap',
  templateUrl: 'detailmap.html'
})
export class DetailMapPage {
	items: Array<{title: string, note: string, icon: string}>;
	numitems: number;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController) {
		  this.items = [];
		    this.numitems = 3;
		    for (let i = 1; i < this.numitems; i++) {
		      this.items.push({
		        title: 'Mapa ' + i,
		        note: 'Este es el detalle breve del mapa #' + i,
		        icon: 'map'
		      });
		    }
	}


openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mis mapas',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Eliminar mapa',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => {
            console.log("delete");
          }
        },
      ]
    });
    actionSheet.present();
  }

showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Use this lightsaber?',
      message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Agree',
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

}
