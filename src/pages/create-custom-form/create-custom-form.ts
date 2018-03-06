import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';

import { QuestionService } from '../../providers/questions/question.service';
import { QuestionControlService }  from '../../providers/questions/question-control.service';

import {CustomForm} from "../../entities/customForm";
import { AlertController } from 'ionic-angular';

import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

import {ModalCreateFormFieldPage} from '../modal-create-form-field/modal-create-form-field';

@IonicPage()
@Component({
  selector: 'page-create-custom-form',
  templateUrl: 'create-custom-form.html',
  providers:  [QuestionService, QuestionControlService]
})
export class CreateCustomFormPage {

  formEntity:CustomForm;
  form:FormGroup;
  questions: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, service: QuestionService, private qcs: QuestionControlService, public alertCtrl: AlertController, private modalController: ModalController, public viewCtrl: ViewController) {
  	this.questions = []; //service.getQuestions();
    this.updateForm();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateCustomFormPage');
  }


  updateForm(){
      this.form = this.qcs.toFormGroup(this.questions);
  }


  appendInput(){
      this.presentModalFieldCreator("textbox");
  }

  appendDropdown(){
       this.presentModalFieldCreator("dropdown");
  }


  presentModalFieldCreator(fieldType){
      var self = this;
      const modalNewFormField = this.modalController.create(ModalCreateFormFieldPage, {
          fieldType: fieldType 
      });
      modalNewFormField.present();

      modalNewFormField.onDidDismiss((data) => {
          if (data.question){
            let newQuestion = data.question;
            self.questions.push(newQuestion);
            self.updateForm();
          }
      });
  }

  saveForm(){
    console.log(this.form);
    console.log(JSON.stringify(this.form.value));
  }


}
