import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController, AlertController} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { getRepository, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';

import {HomePage} from '../home/home';

import {Map} from "../../entities/map";

@Component({
  selector: 'page-detailmap',
  templateUrl: 'detailmap.html'
})
export class DetailMapPage {
	mapEntity: Map;
  mapRepository: any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController,  private toast: Toast, private utils: UtilsProvider) {
      this.mapEntity = navParams.get('map');
	}

  ionViewDidLoad() {
      this.mapRepository = getRepository('map') as Repository<Map>;
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
              this.presentAlertDelete();
          }
        },
      ]
    });
    actionSheet.present();
  }



getMapDate(){
  return this.utils.getDateFromUNIX(this.mapEntity.creation_date);
}

presentAlertDelete() {
    var self = this;
    let alert = this.alertCtrl.create({
    title: 'Eliminar mapa',
    message: '¿Está seguro de que desea eliminar el mapa?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          
        }
      },
      {
        text: 'Eliminar',
        handler: () => {
          this.mapRepository.remove(this.mapEntity).then(entity => {
            self.toast.showShortTop("Mapa eliminado con éxito").subscribe(
              entity => {
                self.navCtrl.push(HomePage, {
              });
              }   
            );
          });
        }
      }
    ]
  });
  alert.present();
}

}