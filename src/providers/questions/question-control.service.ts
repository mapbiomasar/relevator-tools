import { Injectable }   from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../../components/question-base';
import {CustomFormElement} from "../../entities/customFormElement";

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: CustomFormElement[], data) {
  	console.log("existent data");
  	console.log(data);
    let group: any = {};

    questions.forEach(question => {
      group[question.key] = new FormControl(this.getFormControlValue(question.key, data));
    });
    return new FormGroup(group);
  }


  private getFormControlValue(key, data){
  	if (data){
  		return data[key];
  	} else {
  		return "";
  	}
  }
}