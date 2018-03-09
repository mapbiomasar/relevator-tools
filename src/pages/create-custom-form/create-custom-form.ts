import { Component } from '@angular/core';
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

  contextData = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, service: QuestionService, private qcs: QuestionControlService, public alertCtrl: AlertController, private modalController: ModalController, public viewCtrl: ViewController,  private toast: Toast, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
    this.formRepository = getRepository('customForm') as Repository<CustomForm>;
    this.formElementsRepository = getRepository('customFormElement') as Repository<CustomFormElement>;
    this.formEntity = this.navParams.get("form");
    if (!this.isEditingContext()){
        this.formEntity = new CustomForm();
        this.formEntity.name = "Nuevo formulario";
        this.formEntity.form_elements = [];
    }
    this.setContextData();
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
      this.form = this.qcs.toFormGroup(this.formEntity.form_elements);
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
            this.formEntity.form_elements.push(newFormElement);
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
                   self.navCtrl.popToRoot();
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
