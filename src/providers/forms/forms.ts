import { Injectable } from '@angular/core';

import { getRepository, Repository } from 'typeorm';

import { ConfigProvider }  from '../config/config';

import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";
import {AppConfig} from "../../entities/appConfig";

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
  	/*let appConfig = await this.configProvider.getAppConfig();
  	let form = await this.formRepository.findOne({where:{id:appConfig.default_form}, relations:["parent_form","form_elements", "parent_form.form_elements"]});
  	if (form){
      return form;
  	}
  	return null;*/
    let forms = await this.formRepository.find();
    if (forms){
      let defaultForm = forms[0];
      if (defaultForm){
        return defaultForm;
      }
    }
    return null;
  }


  public async loadFormElements(customForm){
    if (!customForm.form_elements){
        customForm.form_elements = [];
        let elements = await this.formElementsRepository.find({where:{formId:customForm.id}});
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

}
