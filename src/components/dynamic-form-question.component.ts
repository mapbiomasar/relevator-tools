import { Component, Input } from '@angular/core';
import { FormGroup }        from '@angular/forms';

import {CustomFormElement} from "../entities/customFormElement";

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html'
})
export class DynamicFormQuestionComponent {
  @Input() question: CustomFormElement;
  @Input() form: FormGroup;
  get isValid() { return this.form.controls[this.question.key].valid; }

  getQuestionOptions(){
  	return JSON.parse(this.question.options);
  }

}