import { Component, Input, OnChanges }  from '@angular/core';
import { FormGroup }                 from '@angular/forms';
 
import { QuestionBase }              from './question-base';
import { QuestionControlService }    from '../providers/questions/question-control.service';

import { TextboxQuestion }  from './question-textbox';
 
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [ QuestionControlService ]
})
export class DynamicFormComponent implements OnChanges {
 
  @Input() questions: QuestionBase<any>[] = [];
  @Input() form: FormGroup;
  payLoad = '';
 
  constructor(private qcs: QuestionControlService) {

  }
 
  ngOnChanges() {
    console.log("change");
    //this.form = this.qcs.toFormGroup(this.questions);
  }
 
  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }
}