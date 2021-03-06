import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, ViewController, ActionSheetController} from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';
import { Toast } from '@ionic-native/toast';

import { QuestionService } from '../../providers/questions/question.service';
import { QuestionControlService }  from '../../providers/questions/question-control.service';
import { FormsProvider }  from '../../providers/forms/forms';
import { ConfigProvider }  from '../../providers/config/config';

import { UtilsProvider } from '../../providers/utils/utils';

import { AlertController } from 'ionic-angular';

import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";
import {Survey} from "../../entities/survey";

import { FormGroup } from '@angular/forms';

import {ModalCreateFormFieldPage} from '../modal-create-form-field/modal-create-form-field';

@IonicPage()
@Component({
  selector: 'page-create-custom-form',
  templateUrl: 'create-custom-form.html',
  providers:  [QuestionService, QuestionControlService]
})
export class CreateCustomFormPage {

  formRepository:any;
  formElementsRepository:any;
  formEntity:CustomForm;

  surveyRepository:any;

  form:FormGroup;
  formsList:CustomForm[] = [];

  parentFormSelected:number = null;

  contextData = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, service: QuestionService, 
              public alertCtrl: AlertController, private modalController: ModalController, public viewCtrl: ViewController,  
              private toast: Toast, public platform: Platform, public actionsheetCtrl: ActionSheetController, 
              private formsProvider: FormsProvider, private configProvider: ConfigProvider,
              private utils: UtilsProvider
    ) {
    this.formRepository = getRepository('customForm') as Repository<CustomForm>;
    this.surveyRepository = getRepository('survey') as Repository<Survey>;
    this.formElementsRepository = getRepository('customFormElement') as Repository<CustomFormElement>;
    this.formEntity = this.navParams.get("form");
    if (!this.isEditingContext()){
        this.formEntity = new CustomForm();
        this.formEntity.name = "Nuevo formulario";
        this.formEntity.form_elements = [];
    }
    if (this.formEntity.parent_form){
      this.parentFormSelected = this.formEntity.parent_form.id;
    }
    /*if (!this.formEntity.parent_form){
        this.formEntity.parent_form = new CustomForm();
        this.formEntity.parent_form.id = 0;
    }*/
    this.setContextData();
    this.getFormsList();
    this.updateForm();
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
    this.updateForm();
  }


  updateForm(){
      //this.form = this.qcs.toFormGroup(this.formEntity.form_elements);
  }

  async getFormsList(){
    let forms = await this.formRepository.find({relations:["form_elements"]});
    if (forms){
        this.formsList = forms;
    }
  }

  parentFormCanBeChanged(){
    return true;
  }


  parentFormInitChange(selectedFormID: any) {
    if (this.parentFormCanBeChanged()){
        this.formEntity.parent_form = this.getFormObject(this.parentFormSelected);
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


  presentModalFieldCreator(fieldType){
      var self = this;
      const modalNewFormField = this.modalController.create(ModalCreateFormFieldPage, {
          fieldType: fieldType 
      });
      modalNewFormField.present();

      modalNewFormField.onDidDismiss((data) => {

          if (data.formElement){
              let newFormElement = data.formElement;
              newFormElement.form = this.formEntity;
              let newElements = this.formEntity.form_elements.concat([newFormElement]);
              this.formEntity.form_elements = newElements;
              self.updateForm();
          }
      });
  }

  saveForm(){
    var self = this;
    var message = "Formulario " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
    var toastFiredOnce = false;
    this.formRepository.save(this.formEntity)
    .then(function(savedForm) {
        self.setDefaultFormconfig();
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

  async setDefaultFormconfig(){
      let uniqueForm = await this.formsProvider.getUniqueForm();
      if (uniqueForm){
        let config = await this.configProvider.getAppConfig();
        config.default_form = uniqueForm.id;
        this.configProvider.saveConfig(config);
      }
  }

  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
    title: 'Formulario',
    cssClass: 'action-sheets-basic-page',
    buttons: [
    {
      text: 'Eliminar formulario',
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


    presentAlertDelete() {
      if (this.isEditingContext()){ // Solo permitir eliminar si se está editando
      var self = this;
      var toastFiredOnce = false;
      let alert = this.alertCtrl.create({
      title: 'Eliminar formulario',
      message: '¿Está seguro de que desea eliminar el formulario?. Esta acción borrara a este formulario y a todos sus formularios hijos',
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
              if (this.formHasChilds()){
                  this.utils.showBasicAlertMessage("Error", "No se puede eliminar el formulario ya que tiene otros formularios asociados (formularios hijos)");
              } else if ( this.formHasSurveys()){
                this.utils.showBasicAlertMessage("Error", "No se puede eliminar el formulario ya que tiene relevamientos asociados!");
              } else {
                  this.formElementsRepository.remove(this.formEntity.form_elements);
                  this.formRepository.remove(this.formEntity).then(entity => {
                  self.toast.showShortTop("Formulario eliminado con éxito").subscribe(
                    entity => {
                      if (!toastFiredOnce){
                        self.navCtrl.popToRoot();
                        toastFiredOnce = true;
                      }
                    }   
                  );
                });
              }
          }
        }
      ]
      });
      alert.present();
    }
  }


  formHasChilds(){
    return this.formEntity.child_forms.length;
  }

  formHasSurveys(){
    this.surveyRepository.find({formId: this.formEntity.id}).then( (surveys) => {
      return surveys.length;
    })

  }


}
