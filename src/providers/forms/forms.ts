import { Injectable } from '@angular/core';

import { getRepository, Repository } from 'typeorm';


import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";
import {AppConfig} from "../../entities/appConfig";

import { ConfigProvider } from "../config/config";

@Injectable()
export class FormsProvider {

  formRepository:any;
  formElementsRepository:any;
  configRepository:any;

  constructor(private configProvider: ConfigProvider) {
  	this.formRepository = getRepository('customForm') as Repository<CustomForm>;
    this.formElementsRepository = getRepository('customFormElement') as Repository<CustomFormElement>;
    this.configRepository = getRepository('appconfig') as Repository<AppConfig>;
  }


  public async getDefaultForm(){
    let defaultForm = null;
    let appConfig = await this.configProvider.getAppConfig();
    let defaultFormID = appConfig.default_form || null;
    if (defaultFormID){
        defaultForm = await this.formRepository.findOne({where:{id:defaultFormID}});
    } else { 
        let forms = await this.formRepository.find();
        defaultForm = forms[0];
    }
    return defaultForm;
  }


  public async loadFormElements(customForm){
    if (!customForm.form_elements){
        customForm.form_elements = [];
        let elements = await this.formElementsRepository.find({where:{form:{id:customForm.id}}});
        if (elements){
          customForm.form_elements = elements;
        }
    }
  }


  public async loadForm(formId){
      let newCustomForm = await this.formRepository.findOne({where:{id:formId}, relations:["parent_form","form_elements", "parent_form.form_elements"]});
      if (newCustomForm){
        return newCustomForm;
      }
  }


  public async getUniqueForm(){
    let forms = await this.formRepository.find();
    if (forms.length == 1){
      return forms[0];
    }
    return null;
  }

  public async getFormsList(){
    let forms = await this.formRepository.find({relations:["form_elements", "parent_form", "parent_form.form_elements"]});
    return forms;
  }

}
