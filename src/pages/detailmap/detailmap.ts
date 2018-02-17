import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController, AlertController} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { getRepository, getManager, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';
import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import {HomePage} from '../home/home';
import {CreateMapPage} from '../createmap/createmap';
import {CreateMarkerPage} from '../createmarker/createmarker';
import {DetailsurveyPage} from '../detailsurvey/detailsurvey';
import {CreatesurveyPage} from '../createsurvey/createsurvey';

import {Map} from "../../entities/map";
import {Marker} from "../../entities/marker";
import {Survey} from "../../entities/survey";
import {MediaFileEntity} from "../../entities/mediafileentity";

@Component({
  selector: 'page-detailmap',
  templateUrl: 'detailmap.html'
})
export class DetailMapPage {
	mapEntity: Map;
  mapRepository: any;

  markers:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController,  private toast: Toast, private utils: UtilsProvider, private appFilesProvider: AppFilesProvider) {
      this.mapEntity = navParams.get('map');
	}

  ionViewDidLoad() {
      this.mapRepository = getRepository('map') as Repository<Map>;
      this.loadRawSurveyMarkersAndPopulate();
      
  }




async loadRawSurveyMarkersAndPopulate(){
    let markersRepository = getRepository('marker') as Repository<Marker>;
    var markers = [];
    const manager = getManager();
    var surveysIds = this.getSurveysIds();
    var idList = '('+surveysIds.join(',')+')';
    console.log(idList);
    let surveyMarkers = await  manager.query(`SELECT * FROM marker WHERE surveyID IN ` + idList);
    for (let i = 0; i < surveyMarkers.length; ++i){
      var tmpMarker = markersRepository.create(surveyMarkers[i]);
      markers.push(tmpMarker);
    }
    console.log(markers);
    this.markers = markers;
  }

viewSurvey(event, survey){
  var self = this;
  this.navCtrl.push(DetailsurveyPage, {
      map: self.mapEntity,
      survey: survey
  });
}

openMenu() {
      var self = this;
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mapa',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Editar datos',
          icon: !this.platform.is('ios') ? 'information-circle' : null,
          handler: () => {
              this.navCtrl.push(CreateMapPage, {
                    map: self.mapEntity
                });
          }
        },
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



getFormattedDate(date){
  return this.utils.getFormattedDate(this.utils.getDateFromUNIX(date));
}

// Borra tanto el mapa como el survey y los marcadores asociados
async deleteMapEntity(){
    let manager = getManager();
    let surveyRep = getRepository('survey') as Repository<Survey>;
    let mapSurveys = await surveyRep.find();
    var self = this;
    await manager.transaction(async manager => {
        let mediaFiles = await self.loadMediaFilesRelations();
        mediaFiles.map(function(item){ // elimina archivos fisicos
          self.appFilesProvider.removeMediaFiles(item);
        });
        await manager.remove(mediaFiles);
        await manager.remove(this.markers);
        await manager.remove(self.mapEntity.surveys);
        await manager.remove(self.mapEntity.layers);
        await manager.remove(self.mapEntity);
        this.toast.showShortTop("Mapa eliminado con éxito").subscribe(
          entity => {
            this.navCtrl.popToRoot();
          }  
        )}
    );
}

createNewSurvey(){
  var self = this;
  this.navCtrl.push(CreatesurveyPage, {
      map: self.mapEntity,
  });
}

getSurveysIds(){
  if (this.mapEntity.surveys){
    return this.mapEntity.surveys.map(function(item) { return item.id; })
  }
  return [];

}


getMarkersIds(){
  return this.markers.map(function(item) { return item.id; })
}

async loadMediaFilesRelations(){
    let markerMediaFiles = [];
    var mediaFilesRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
    const manager = getManager();
    var markersIds = this.getMarkersIds();
    markersIds = '('+markersIds.join(',')+')';
    markerMediaFiles = await  manager.query(`SELECT * FROM mediafile WHERE markerID IN ` + markersIds);
    markerMediaFiles = markerMediaFiles.map(function(mediaFile){
         return mediaFilesRepository.create(mediaFile);
    });
    return markerMediaFiles;
  }


presentAlertDelete() {
    var self = this;
    let alert = this.alertCtrl.create({
    title: 'Eliminar mapa',
    message: '¿Está seguro de que desea eliminar el mapa? Esta acción eliminará tanto al mapa como a los relevamientos, marcadores y archivos de imagen y sonido asociados',
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
          this.deleteMapEntity();
        }
      }
    ]
  });
  alert.present();
}

}