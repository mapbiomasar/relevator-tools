import { Injectable }   from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';

import {CustomFormElement} from "../../entities/customFormElement";

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: CustomFormElement[], data) {
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