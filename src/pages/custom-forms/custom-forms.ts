import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController } from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';


import {CreateCustomFormPage} from '../create-custom-form/create-custom-form';

import {CustomForm} from "../../entities/customForm";

@IonicPage()
@Component({
  selector: 'page-custom-forms',
  templateUrl: 'custom-forms.html',
})
export class CustomFormsPage {

	forms:any;
	formRepository:any;

  	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
  		this.formRepository = getRepository('customForm') as Repository<CustomForm>;
  		this.forms = [];
  	}

    ionViewWillEnter(){
      this.loadForms();
    }

    async loadForms(){
    	this.forms = await this.formRepository.find({relations:["child_forms", "form_elements"]});
    }


    viewForm(event, form){
        /*this.navCtrl.push(ViewMapPage, {
            form: form
        });*/
    }


  	createNewForm(){
      this.navCtrl.push(CreateCustomFormPage, {
        });
    } 

	openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mis formularios',
      cssClass: 'action-sheets-basic-page',
      buttons: [
      	{
          text: 'Nuevo formulario',
          icon: !this.platform.is('ios') ? 'add' : null,
          handler: () => {
            this.createNewForm();
          }
        },
      ]
    });
    actionSheet.present();
  }




}
