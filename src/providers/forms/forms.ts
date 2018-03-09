import { Injectable } from '@angular/core';


import {CustomForm} from "../../entities/customForm";
import { getRepository, Repository } from 'typeorm';

@Injectable()
export class FormsProvider {

  formRepository:any;

  constructor() {
  	this.formRepository = getRepository('customForm') as Repository<CustomForm>;
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

}
