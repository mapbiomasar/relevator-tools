import { Component } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController} from 'ionic-angular';

import {MapTabsPage} from '../maptabs/maptabs';
import {CreateMapPage} from '../createmap/createmap';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	  selectedItem: any;
	  icons: string[];
	  items: Array<{title: string, note: string, icon: string}>;
	  numitems: number;

	  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController) {
	  		this.selectedItem = navParams.get('item');

	  	    this.items = [];
		    this.numitems = 3;
		    for (let i = 1; i < this.numitems; i++) {
		      this.items.push({
		        title: 'Mapa ' + i,
		        note: 'Este es el detalle breve del mapa #' + i,
		        icon: 'map'
		      });
		    }
	  }

  	itemTapped(event, item) {
  	    // That's right, we're pushing to ourselves!
  	    this.navCtrl.push(HomePage, {
  	      item: item
        });
    }


    viewMap(){
        this.navCtrl.push(MapTabsPage, {
          
        });
    }


  	 openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mis mapas',
      cssClass: 'action-sheets-basic-page',
      buttons: [
      	{
          text: 'Nuevo mapa',
          icon: !this.platform.is('ios') ? 'add' : null,
          handler: () => {
            this.navCtrl.push(CreateMapPage, {
            });
          }
        },
        {
          text: 'Importar mapa',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'code-download' : null,
          handler: () => {
            console.log('Import clicked');
          }
        },
      ]
    });
    actionSheet.present();
  }


}
