import { Injectable } from '@angular/core';


import {CustomForm} from "../../entities/customForm";
import {CustomFormElement} from "../../entities/customFormElement";
import { getRepository, Repository } from 'typeorm';

@Injectable()
export class FormsProvider {

  formRepository:any;
  formElementsRepository:any;

  constructor() {
  	this.formRepository = getRepository('customForm') as Repository<CustomForm>;
    this.formElementsRepository = getRepository('customFormElement') as Repository<CustomFormElement>;
  }


  public async getDefaultForm(){
  	console.log(this.formRepository.find());
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

}
