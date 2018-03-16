import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, ViewController, ActionSheetController} from 'ionic-angular';
import { getRepository, Repository } from 'typeorm';
import { Toast } from '@ionic-native/toast';

import { QuestionService } from '../../providers/questions/question.service';
import { QuestionControlService }  from '../../providers/questions/question-control.service';

import { AlertController } from 'ionic-angular';

import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";

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

  formRepository:any;
  formElementsRepository:any;
  formEntity:CustomForm;

  form:FormGroup;
  formsList:CustomForm[] = [];

  parentFormSelected:number = null;

  contextData = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, service: QuestionService, private qcs: QuestionControlService, public alertCtrl: AlertController, private modalController: ModalController, public viewCtrl: ViewController,  private toast: Toast, public platform: Platform, public actionsheetCtrl: ActionSheetController, private zone: NgZone) {
    this.formRepository = getRepository('customForm') as Repository<CustomForm>;
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
        console.log(this.parentFormSelected);
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
              console.log(this.formEntity.form_elements);
              self.updateForm();
          }
      });
  }

  saveForm(){
    var self = this;
    var message = "Formulario " + ((self.isEditingContext()) ? "editado" : "creado") + " con éxito";
    var toastFiredOnce = false;
    console.log(this.formEntity);
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
      ]
      });
      alert.present();
    }
  }



}
