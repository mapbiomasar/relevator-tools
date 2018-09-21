import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import {CustomFormElement} from "../../entities/customFormElement";


@IonicPage()
@Component({
  selector: 'page-modal-create-form-field',
  templateUrl: 'modal-create-form-field.html',
})
export class ModalCreateFormFieldPage {

  fieldType:string;
  formElementObject:CustomFormElement;
  newFieldParams:any = {};

  elementOptions = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  	this.fieldType = navParams.get("fieldType");
  	this.initFormElement();
  }


  initFormElement(){
      this.formElementObject = new CustomFormElement();
      this.formElementObject.tipo = this.fieldType;
  }

  addField(){
    this.dismiss(this.formElementObject);
  }

  labelChanged(event){
    this.formElementObject.key = event;
  }



  addOption(){
    this.elementOptions.push({value:'Nueva opción'});
  }

  dismiss(newQuestion) {
    if (newQuestion){
      newQuestion.options = JSON.stringify(this.elementOptions);
    }
    this.viewCtrl.dismiss({
        formElement: newQuestion
    });
  }



}
