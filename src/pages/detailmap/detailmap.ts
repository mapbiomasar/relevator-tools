import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController, AlertController} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { getRepository, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';

import {HomePage} from '../home/home';
import {CreateMarkerPage} from '../createmarker/createmarker';

import {Map} from "../../entities/map";
import {Marker} from "../../entities/marker";

@Component({
  selector: 'page-detailmap',
  templateUrl: 'detailmap.html'
})
export class DetailMapPage {
	mapEntity: Map;
  mapRepository: any;

  markers:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController,  private toast: Toast, private utils: UtilsProvider) {
      this.mapEntity = navParams.get('map');
	}

  ionViewDidLoad() {
      this.mapRepository = getRepository('map') as Repository<Map>;
      this.loadMarkers();
      
  }


async loadMarkers(){
  let markerRep = getRepository('marker') as Repository<Marker>;
  this.markers = await markerRep.find({ relations: ["mediaFiles"] });
}

viewMarker(event, marker){
  console.log(marker);
  var self = this;
  this.navCtrl.push(CreateMarkerPage, {
      map: self.mapEntity,
      location: [marker.lat, marker.lng],
      marker: marker
  });
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