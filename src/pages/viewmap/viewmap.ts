import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController} from 'ionic-angular';

import {CreateMarkerPage} from '../createmarker/createmarker';

declare var google;

@Component({
  selector: 'page-viewmap',
  templateUrl: 'viewmap.html'
})
export class ViewMapPage {

	@ViewChild('map') mapElement: ElementRef;
  	map: any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
	}


	ionViewDidLoad() {
	    // start my map,
	    let arg = { lat: -34.8902802, lng: -60.0953938 }
	    this.map = new google.maps.Map(this.mapElement.nativeElement, {
	      zoom: 8,
	      center: arg,
	      mapTypeId: 'roadmap'
	    });
	    this.map.setCenter(arg);
  	}

     openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mapa',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Añadir marcador',
          icon: !this.platform.is('ios') ? 'ios-create-outline' : null,
          handler: () => {
              this.navCtrl.push(CreateMarkerPage, {
                  
                });
          }
        },
        {
          text: 'Geolocalizarme',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'locate' : null,
          handler: () => {
            
          }
        },
      ]
    });
    actionSheet.present();
  }

}
