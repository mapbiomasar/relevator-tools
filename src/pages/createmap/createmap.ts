import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import {HomePage} from '../home/home';
import { UtilsProvider } from '../../providers/utils/utils';

import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import { getRepository, Repository } from 'typeorm';

@Component({
  selector: 'page-createmap',
  templateUrl: 'createmap.html'
})
export class CreateMapPage {

	private map: Map = null;

  	constructor(public navCtrl: NavController, public navParams: NavParams, private toast: Toast, private utils: UtilsProvider) {
  		this.map = new Map();
  		this.map.name = "";
  		this.map.description = "";
    }



    getDefaultSurvey(){
    	var survey = new Survey();
    	survey.map = this.map;
    	survey.name = "Relevamiento 1";
    	survey.description = "Relevamiento por defecto";
    	survey.creation_date = this.map.creation_date;
    	return survey;
    }
    

  	saveMap(){
  		this.map.user = 1;
  		this.map.creation_date = this.utils.getNowUnixTimestamp(); // UNIX timestamp, in seconds
  		this.map.config = "";
  		var defSurvey = this.getDefaultSurvey();
  		this.map.surveys = [this.getDefaultSurvey()];
	    const postRepository = getRepository('map') as Repository<Map>;
	    var self  = this;
	    postRepository.save(this.map)
	    .then(function(savedMap) {
	    	console.log(savedMap);
	    	// Creo un survey por defecto para el mapa
	    	self.toast.showShortTop("Mapa creado con éxito").subscribe(
	    		toast => {
				    self.navCtrl.pop();
				  }
	    	);
	    });
	}

}
