import { Component} from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';

import {MapTabsPage} from '../maptabs/maptabs';

@Component({
  selector: 'page-createmarker',
  templateUrl: 'createmarker.html'
})
export class CreateMarkerPage {

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}


  createMarker(){
      this.navCtrl.push(MapTabsPage, {
        
      });
  }

}
