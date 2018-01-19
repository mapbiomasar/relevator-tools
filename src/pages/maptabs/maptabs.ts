import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';

import {ViewMapPage} from '../viewmap/viewmap';
import {DetailMapPage} from '../detailmap/detailmap';


@Component({
  selector: 'page-viewmap',
  templateUrl: 'maptabs.html'
})
export class MapTabsPage {

  tab1Root = ViewMapPage;
  tab2Root = DetailMapPage;

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}


}
