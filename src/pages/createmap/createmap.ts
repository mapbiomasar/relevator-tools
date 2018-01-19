import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import {ViewMapPage} from '../viewmap/viewmap';

@Component({
  selector: 'page-createmap',
  templateUrl: 'createmap.html'
})
export class CreateMapPage {

	  constructor(public navCtrl: NavController, public navParams: NavParams) {

    }


    

      createMap(){
          this.navCtrl.push(ViewMapPage, {
            
          });
      }

}
