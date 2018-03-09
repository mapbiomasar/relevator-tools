import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';
import { Toast } from '@ionic-native/toast';

import { QuestionService } from '../../providers/questions/question.service';
import { QuestionControlService }  from '../../providers/questions/question-control.service';

import { AlertController } from 'ionic-angular';

import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";

import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

import { DropdownQuestion } from '../../components/question-dropdown';
import { TextboxQuestion }  from '../../components/question-textbox';

import {ModalCreateFormFieldPage} from '../modal-create-form-field/modal-create-form-field';

@IonicPage()
@Component({
  selector: 'page-create-custom-form',
  templateUrl: 'create-custom-form.html',
  providers:  [QuestionService, QuestionControlService]
})
export class CreateCustomFormPage {

  formRepository:any;
  formEntity:CustomForm;

  form:FormGroup;
  questions: any[];

  contextData = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, service: QuestionService, private qcs: QuestionControlService, public alertCtrl: AlertController, private modalController: ModalController, public viewCtrl: ViewController,  private toast: Toast) {
    this.formRepository = getRepository('customForm') as Repository<CustomForm>;
  	this.questions = []; //service.getQuestions();
    this.form = this.qcs.toFormGroup(this.questions);
    this.formEntity = this.navParams.get("form");
    if (!this.isEditingContext()){
        this.formEntity = new CustomForm();
        this.formEntity.name = "Nuevo formulario";
        this.formEntity.form_elements = [];
    }
    this.setContextData();
  }

  isEditingContext(){
    if (this.formRepository.hasId(this.formEntity)){
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateCustomFormPage');
    this.updateForm();
  }


  updateForm(){
      this.form = this.qcs.toFormGroup(this.questions);
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
            self.createCustomFormElement(newQuestion, fieldType);
            self.updateForm();
          }
      });
  }


  // receives QuestionBase and construct a CustomFormElement object
  createCustomFormElement(questionBase, fieldType){
      let newCustomFormElement = new CustomFormElement();
      newCustomFormElement.form = this.formEntity;
      newCustomFormElement.name = questionBase.key;
      newCustomFormElement.label = questionBase.label;
      newCustomFormElement.tipo = fieldType;
      newCustomFormElement.options = (questionBase.options) ? JSON.stringify(questionBase.options) : "[]";
      // asocio elemento al form
      this.formEntity.form_elements.push(newCustomFormElement);
      console.log(newCustomFormElement);

  }

  saveForm(){
    var self = this;
    var message = "Formulario " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
    var toastFiredOnce = false;
    this.formRepository.save(this.formEntity)
    .then(function(savedForm) {
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
