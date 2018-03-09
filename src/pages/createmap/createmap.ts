import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import {HomePage} from '../home/home';
import { UtilsProvider } from '../../providers/utils/utils';
import { FormsProvider } from '../../providers/forms/forms';
import { ToastProvider } from '../../providers/toast/toast';

import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import { getRepository, Repository } from 'typeorm';

@Component({
  selector: 'page-createmap',
  templateUrl: 'createmap.html'
})
export class CreateMapPage {

  private mapRepository:any;
	private map: Map;

  contextData = {};


  	constructor(public navCtrl: NavController, public navParams: NavParams, private toast: Toast, private toastProvider: ToastProvider, private utils: UtilsProvider, private formsProvider: FormsProvider) {
      this.mapRepository = getRepository('map') as Repository<Map>;
  		this.map = this.navParams.get("map");
      if (!this.isEditingContext()){
        this.map = new Map();
        this.map.name = "";
        this.map.description = "";
      }
      this.setContextData();
    }


    private isEditingContext(){
      if (this.mapRepository.hasId(this.map)){
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


    getDefaultSurvey(){
    	var survey = new Survey();
    	survey.map = this.map;
    	survey.name = "Relevamiento 1";
    	survey.description = "Relevamiento creado por defecto";
    	survey.creation_date = this.map.creation_date;
      survey.author_name = "Usuario";
      this.bindDefaultForm(survey);
      console.log(survey);
    	return survey;
    }


    async bindDefaultForm(survey){
      let form = await this.formsProvider.getDefaultForm();
      console.log("FORM!");
      console.log(form);
      if (form){
        survey.form = form;
      }
    }
    

  	saveMap(){
      if (!this.isEditingContext()){
    		this.map.user = 1;
    		this.map.creation_date = this.utils.getNowUnixTimestamp(); // UNIX timestamp, in seconds
    		this.map.config = "";
    		var defSurvey = this.getDefaultSurvey();
    		this.map.surveys = [this.getDefaultSurvey()];
      }
	    const postRepository = getRepository('map') as Repository<Map>;
	    var self  = this;
      var message = "Mapa " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
      var toastFiredOnce = false;
	    postRepository.save(this.map)
	    .then(function(savedMap) {
	    	// Creo un survey por defecto para el mapa
	    	self.toast.showShortTop(message).subscribe(
	    		toast => {
            if (!toastFiredOnce){
				      self.navCtrl.pop();
              toastFiredOnce = true;
            }
				  }
	    	);
	    });
	}

}
