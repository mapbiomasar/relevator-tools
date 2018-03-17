import { Component, Input, Output, EventEmitter, OnChanges, DoCheck }  from '@angular/core';
import { FormGroup }                 from '@angular/forms';
 
import { QuestionBase }              from './question-base';
import { QuestionControlService }    from '../providers/questions/question-control.service';

import {CustomForm} from "../entities/customForm";
import {CustomFormElement} from "../entities/customFormElement";
 
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [ QuestionControlService ]
})
export class DynamicFormComponent implements OnChanges, DoCheck {
 
  @Input() formEntity:CustomForm;
  @Input() formData = null;

  form: FormGroup;
  @Output() formGroupChange:EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  formElements: CustomFormElement[] = [];

  payLoad = '';

  oldFormElements = [];
  oldParentForm = null;
  changeDetected = false;
 
  constructor(private qcs: QuestionControlService) {
  }

  ngOnChanges(){
    this.updateFormElements();
  }

  updateFormElements(){
    let self = this;
    this.formElements = [];
    this.loadFormElements(this.formEntity, false);
    this.form = this.qcs.toFormGroup(this.formElements, this.formData);
    this.form.valueChanges.subscribe(val => {
        self.formGroupChange.emit(val);
    });
  }

  ngDoCheck() {
    this.changeDetected = false;
    if (this.formEntity.form_elements !== this.oldFormElements) {
        this.changeDetected = true;
        this.oldFormElements = this.formEntity.form_elements;
    }
    if (this.formEntity.parent_form && (this.formEntity.parent_form.id !== this.oldParentForm)){
        this.changeDetected = true;
        this.oldParentForm = this.formEntity.parent_form.id;
    }
    if (this.changeDetected){
        this.updateFormElements();
    }
  }


  private loadFormElements(form, loadRelatedElements){
      if (form.parent_form){
          this.loadFormElements(form.parent_form, true);
      }
      for (let i in form.form_elements){
        this.formElements.push(form.form_elements[i]);
      }
  }

 
  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }
}