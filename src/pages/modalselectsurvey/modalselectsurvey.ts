import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import {Survey} from "../../entities/survey";


@IonicPage()
@Component({
  selector: 'page-modalselectsurvey',
  templateUrl: 'modalselectsurvey.html',
})

export class ModalselectsurveyPage {

  surveys:Survey[];
  surveySelected:Survey;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  	this.surveys = navParams.get("surveys");
  	this.surveySelected = navParams.get("survey_selected");
  }

  ionViewDidLoad() {
    
  }

  updateSurvey(survey){
  	this.surveySelected = survey;
  	this.dismiss();
  }

  dismiss() {
  	const data = {
  		survey_selected: this.surveySelected
  	};
    this.viewCtrl.dismiss(data);
  }

}
