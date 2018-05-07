import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { UtilsProvider } from '../../providers/utils/utils';
import { FormsProvider } from '../../providers/forms/forms';

import { getRepository, Repository } from 'typeorm';

import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import {CustomForm} from "../../entities/customForm";

@IonicPage()
@Component({
  selector: 'page-createsurvey',
  templateUrl: 'createsurvey.html',
})
export class CreatesurveyPage {

	formRepository:any;
	surveyRepository:any;

	map:Map;
	survey:Survey;
	formsList:CustomForm[] = [];

	surveyFormSelected:number = null;

	contextData = {};

	constructor(public navCtrl: NavController, public navParams: NavParams, private toast: Toast, private utils: UtilsProvider, private formsProvider: FormsProvider) {
		this.formRepository = getRepository('customForm') as Repository<CustomForm>;
	 	this.surveyRepository = getRepository('survey') as Repository<Survey>;
		this.map = navParams.get("map");
		this.survey = navParams.get("survey");
		if (!this.isEditingContext()){
	        this.survey = new Survey();
	        this.survey.name = "Relevamiento " + (this.map.surveys.length + 1);
	        this.survey.description = "Descripción";
	        this.survey.author_name = "Usuario";
	        this.survey.map = this.map;
	        //this.bindDefaultForm(this.survey);
      	}
      	this.setContextData();
	}

  	async ionViewDidLoad() {	
  		await this.getFormsList();
  		if (this.survey.form) {
  			this.surveyFormSelected = this.survey.form.id;
		} else {
			this.bindDefaultForm(this.survey);
		}
  	}


	async getFormsList(){
		let forms = await this.formsProvider.getFormsList();
		if (forms){
		    this.formsList = forms;
		}
	}

	async bindDefaultForm(survey){
		let form = await this.formsProvider.getDefaultForm();
		if (form){
			survey.form = form;
			this.surveyFormSelected = survey.form.id;
		}
	}

  	getFormObject(formID){
		for (let i in this.formsList){
			if (this.formsList[i].id == formID){
			  return this.formsList[i];
			}
		}
		return null;
  	}

  	surveyFormCanBeChanged(){
    	return true;
  	}

  	surveyFormInitChange(selectedFormID: any) {
	    if (this.surveyFormCanBeChanged()){
	        this.survey.form = this.getFormObject(this.surveyFormSelected);
	    }
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
		var toastFiredOnce = false;
		var message = "Relevamiento " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
		this.survey.creation_date = this.utils.getNowUnixTimestamp();
		this.surveyRepository.save(this.survey)
	    .then(function(savedSurvey) {
	    	self.toast.showShortTop(message).subscribe(
	    		toast => {
				     if (!toastFiredOnce){
				      	 self.navCtrl.popToRoot();
		              	toastFiredOnce = true;
		            }
				  }
	    	);
	    });
	}

}
