import { Component } from '@angular/core';
import { NavController, NavParams, AlertController} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';

import {CustomFormsPage} from '../custom-forms/custom-forms';

import { UtilsProvider } from '../../providers/utils/utils';
import { FormsProvider } from '../../providers/forms/forms';

import { getRepository, Repository } from 'typeorm';

import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import {CustomForm} from "../../entities/customForm";



@Component({
  selector: 'page-createmap',
  templateUrl: 'createmap.html'
})
export class CreateMapPage {

  private mapRepository:any;
	private map: Map;


  private mapDefaultCenter = [-60.0953938, -34.8902802];
  private mapDefaultZoom = 4;

  contextData = {};





  	constructor(public navCtrl: NavController, public navParams: NavParams, private toast: Toast, private utils: UtilsProvider, private formsProvider: FormsProvider, public alertCtrl: AlertController) {
      this.mapRepository = getRepository('map') as Repository<Map>;
  		this.map = this.navParams.get("map");
      if (!this.isEditingContext()){
        this.map = new Map();
        this.map.name = "";
        this.map.description = "";
      }
      this.setContextData();
    }


    ionViewDidLoad(){
      this.checkFormExistence();
    }

    async checkFormExistence(){
      let formRepository = getRepository('customForm') as Repository<CustomForm>;
      let forms = await formRepository.find();
      if (!forms.length){
          let alert = this.alertCtrl.create({
            title: 'No existen formularios',
            message: 'Para crear un mapa, primero es necesario tener un formulario creado.',
            buttons: [
              {
                text: 'Crear un formulario',
                handler: () => {
                    this.navCtrl.setRoot(CustomFormsPage)
                }
              }
            ]
          });
          alert.present();
      }
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


    async getDefaultSurvey(){
    	var survey = new Survey();
    	survey.map = this.map;
    	survey.name = "Relevamiento 1";
    	survey.description = "Relevamiento creado por defecto";
    	survey.creation_date = this.map.creation_date;
      survey.author_name = "Usuario";
      await this.bindDefaultForm(survey);
    	return survey;
    }


    async bindDefaultForm(survey){
      let form = await this.formsProvider.getDefaultForm();
      if (form){
        survey.form = form;
      }
    }
    

  	async saveMap(){
      if (!this.isEditingContext()){
        		this.map.user = 1;
        		this.map.creation_date = this.utils.getNowUnixTimestamp(); // UNIX timestamp, in seconds
        		this.map.config = JSON.stringify({"center": this.mapDefaultCenter, 
                                              "zoom": this.mapDefaultZoom, 
                                              "layers_config":{
                                                      "surveys":{}, 
                                                      "local":{}
                                              }
            });
            let defaultSurvey = await this.getDefaultSurvey();
        		this.map.surveys = [defaultSurvey];
      }
	    const mapRepository = getRepository('map') as Repository<Map>;
	    var self  = this;
      var message = "Mapa " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
      var toastFiredOnce = false;
	    mapRepository.save(this.map)
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
