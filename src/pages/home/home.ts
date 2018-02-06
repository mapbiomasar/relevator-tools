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
      console.log(this.maps);
      /*this.mapRepository.clear();
      
      let markersRep = getRepository('marker') as Repository<Marker>;
      let ma = await markersRep.find();
      console.log(ma);
      markersRep.clear();
      let markers = await markersRep.find();
      console.log(markers);

      let mediaRep = getRepository('mediafile') as Repository<MediaFileEntity>;
      let m = await mediaRep.find();
      console.log(m);
      mediaRep.clear();
      let media = await mediaRep.find();
      console.log(media);

      let surveyRep = getRepository('survey') as Repository<Survey>;
      let surveys = await surveyRep.find();
      console.log(surveys);
      surveyRep.clear();
      let lsurveys = await surveyRep.find();
      console.log(lsurveys);*/

      // FOREIGN KEY FAIL - ELIMINAR SURVEYS - ELIMINAR Survey al eliminar mapaf
      
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
