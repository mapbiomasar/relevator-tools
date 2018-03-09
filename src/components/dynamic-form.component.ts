import { Component, Input, OnChanges }  from '@angular/core';
import { FormGroup }                 from '@angular/forms';
 
import { QuestionBase }              from './question-base';
import { QuestionControlService }    from '../providers/questions/question-control.service';

import {CustomFormElement} from "../entities/customFormElement";
 
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [ QuestionControlService ]
})
export class DynamicFormComponent{
 
  @Input() formElements: CustomFormElement[];
  @Input() form: FormGroup;
  payLoad = '';
 
  constructor(private qcs: QuestionControlService) {
  }
 
  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }
}