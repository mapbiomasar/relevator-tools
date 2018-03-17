import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, AlertController} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { getRepository, getManager, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';
import { AppFilesProvider } from '../../providers/appfiles/appfiles';


import {Survey} from "../../entities/survey";
import {Marker} from "../../entities/marker";
import {Map} from "../../entities/map";

import {CreateMarkerPage} from '../createmarker/createmarker';
import {CreatesurveyPage} from '../createsurvey/createsurvey';
import {MediaFileEntity} from "../../entities/mediafileentity";

@IonicPage()
@Component({
  selector: 'page-detailsurvey',
  templateUrl: 'detailsurvey.html',
})
export class DetailsurveyPage {

	  map:Map;
	  survey:Survey;
	  markers:Marker[];

	  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController,  private toast: Toast, private utils: UtilsProvider, private appFilesProvider: AppFilesProvider) {
	  	this.map = navParams.get("map");
	  	this.survey = navParams.get("survey");
	  }

	  ionViewDidLoad() {
	    this.loadSurveyMarkers()
	  }


	async loadSurveyMarkers(){
		let markersRepository = getRepository('marker') as Repository<Marker>;
	    var markers = [];
	    const manager = getManager();
	    let surveyMarkers = await  manager.query(`SELECT * FROM marker WHERE surveyID = ` + this.survey.id);
	    for (let i = 0; i < surveyMarkers.length; ++i){
	      var tmpMarker = markersRepository.create(surveyMarkers[i]);
	      markers.push(tmpMarker);
	    }
	    console.log(markers);
	    this.markers = markers;
	}

  	getSurveyDate(){
	  return this.utils.getFormattedDate(this.utils.getDateFromUNIX(this.survey.creation_date));
	}


	viewMarker(event, marker){
    marker.survey = this.survey;
	  var self = this;
	  this.navCtrl.push(CreateMarkerPage, {
	      map: self.map,
	      marker: marker
	  });
	}


	openMenu() {
      var self = this;
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Relevamiento',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Editar datos',
          icon: !this.platform.is('ios') ? 'md-create' : null,
          handler: () => {
              this.navCtrl.push(CreatesurveyPage, {
                    map: self.map,
                    survey: self.survey
                });
          }
        },
        {
          text: 'Eliminar relevamiento',
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

async deleteSurveyEntity(){
    let manager = getManager();
    var self = this;
    var toastFiredOnce = false;
    await manager.transaction(async manager => {
        let mediaFiles = await self.loadMediaFilesRelations();
        mediaFiles.map(function(item){ // elimina archivos fisicos
          self.appFilesProvider.removeMediaFiles(item);
        });
        await manager.remove(mediaFiles);
        await manager.remove(this.markers);
        await manager.remove(self.survey);
        this.toast.showShortTop("Relevamiento eliminado con éxito").subscribe(
          entity => {
            if (!toastFiredOnce){
                self.navCtrl.pop();
                toastFiredOnce = true;
            }
          }  
        )}
    );
}

getMarkersIds(){
  return this.markers.map(function(item) { return item.id; })
}


async loadMediaFilesRelations(){
    let markerMediaFiles = [];
    var mediaFilesRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
    const manager = getManager();
    var markersIds = this.getMarkersIds();
    var idList = '('+markersIds.join(',')+')';
    markerMediaFiles = await  manager.query(`SELECT * FROM mediafile WHERE markerID IN ` + idList);
    markerMediaFiles = markerMediaFiles.map(function(mediaFile){
         return mediaFilesRepository.create(mediaFile);
    });
    return markerMediaFiles;
  }


presentAlertDelete() {
    var self = this;
    let alert = this.alertCtrl.create({
    title: 'Eliminar Relevamiento',
    message: '¿Está seguro de que desea eliminar el relevamiento? Esta acción eliminará tanto al relevamiento como a sus marcadores y archivos de imagen y sonido asociados',
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
          this.deleteSurveyEntity();
        }
      }
    ]
  });
  alert.present();
}

}
