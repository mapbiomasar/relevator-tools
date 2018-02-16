import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { UtilsProvider } from '../../providers/utils/utils';

import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import { getRepository, Repository } from 'typeorm';

@IonicPage()
@Component({
  selector: 'page-createsurvey',
  templateUrl: 'createsurvey.html',
})
export class CreatesurveyPage {

	surveyRepository:any;

	map:Map;
	survey:Survey;

	contextData = {};

	constructor(public navCtrl: NavController, public navParams: NavParams, private toast: Toast, private utils: UtilsProvider) {
	 	this.surveyRepository = getRepository('survey') as Repository<Survey>;
		this.map = navParams.get("map");
		this.survey = navParams.get("survey");
		if (!this.isEditingContext()){
	        this.survey = new Survey();
	        this.survey.name = "Relevamiento " + (this.map.surveys.length + 1);
	        this.survey.description = "Descripción";
	        this.survey.author_name = "Usuario";
	        this.survey.map = this.map;
	      }
      this.setContextData();
	}

	ionViewDidLoad() {
	console.log('ionViewDidLoad CreatesurveyPage');
	}

	private isEditingContext(){
      if (this.surveyRepository.hasId(this.survey)){
        return true;
      }
      return false;
    }


    private setContextData(){
      if (this.isEditingContext()){
        this.contextData["title"] = "Editar";
        this.contextData["button_save_text"] = "Actualizar";
      } else {
        this.contextData["title"] = "Nuevo";
        this.contextData["button_save_text"] = "Guardar";
      }
    }


	saveSurvey(){
		var self = this;
		var message = "Relevamiento " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
		this.survey.creation_date = this.utils.getNowUnixTimestamp();
		this.surveyRepository.save(this.survey)
	    .then(function(savedSurvey) {
	    	// Creo un survey por defecto para el mapa
	    	self.toast.showShortTop(message).subscribe(
	    		toast => {
				     self.navCtrl.popToRoot();
				  }
	    	);
	    });
	}

}
