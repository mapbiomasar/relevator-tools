import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { QuestionBase }     from '../../components/question-base';
import { TextboxQuestion }  from '../../components/question-textbox';
import { DropdownQuestion }  from '../../components/question-dropdown';

@IonicPage()
@Component({
  selector: 'page-modal-create-form-field',
  templateUrl: 'modal-create-form-field.html',
})
export class ModalCreateFormFieldPage {

  fieldType:string;
  questionObject:QuestionBase<any>;
  newFieldParams:any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  	this.fieldType = navParams.get("fieldType");
  	this.initQuestionObject();
  }


  initQuestionObject(){
      let self = this;
  		if (this.fieldType == "textbox"){
  			this.questionObject = new TextboxQuestion();
  		} else if (this.fieldType == "dropdown"){
  			this.questionObject = new DropdownQuestion();
  		}
  }


  addField(){
    this.dismiss(this.questionObject);
  }



  addOption(){
    this.questionObject["options"].push({key: 'newoption', value:'Opcion'});
  }

  dismiss(newQuestion) {
    let self = this;
    this.viewCtrl.dismiss({
        question: newQuestion
    });
  }



}
