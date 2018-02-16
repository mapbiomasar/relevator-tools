import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController} from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';

import {CreateMapPage} from '../createmap/createmap';
import {ViewMapPage} from '../viewmap/viewmap';

import {Map} from "../../entities/map";
import {Marker} from "../../entities/marker";
import {Survey} from "../../entities/survey";
import {MediaFileEntity} from "../../entities/mediafileentity";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    maps:any;
    mapRepository: any;


	  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
      this.mapRepository = getRepository('map') as Repository<Map>;
      this.maps = [];
	  }

    ionViewDidLoad() {
    }

    ionViewWillEnter(){
      this.loadHome();
    }


    async loadHome(){

      this.maps = await this.mapRepository.find({relations:["surveys"]});
    }


    viewMap(event, item){
        console.log(item);
        this.navCtrl.push(ViewMapPage, {
            map: item
        });
    }

    createNewMap(){
      this.navCtrl.push(CreateMapPage, {
      });
    } 


  	 openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mis mapas',
      cssClass: 'action-sheets-basic-page',
      buttons: [
      	{
          text: 'Nuevo mapa',
          icon: !this.platform.is('ios') ? 'add' : null,
          handler: () => {
            this.createNewMap();
          }
        },
        {
          text: 'Importar mapa',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'code-download' : null,
          handler: () => {
            console.log('Import clicked');
          }
        },
      ]
    });
    actionSheet.present();
  }


}
