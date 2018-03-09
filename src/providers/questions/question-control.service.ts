import { Injectable }   from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../../components/question-base';
import {CustomFormElement} from "../../entities/customFormElement";

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: CustomFormElement[] ) {
  	console.log(questions);
    let group: any = {};

    questions.forEach(question => {
      group[question.key] = new FormControl('' || '');
    });
    return new FormGroup(group);
  }
}