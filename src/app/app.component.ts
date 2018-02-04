import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MediafilesProvider } from '../providers/mediafiles/mediafiles';

import { createConnection } from 'typeorm'
import {Map} from "../entities/map";
import {Survey} from "../entities/survey";
import {Marker} from "../entities/marker";
import {MediaFileEntity} from "../entities/mediafileentity";

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private mediafilesProvider: MediafilesProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Mis mapas', component: HomePage },
      { title: 'Configuracion', component: ListPage },
    ];

  }

  initializeApp() {

    this.platform.ready().then(async () => {

      this.statusBar.styleDefault();
      //this.splashScreen.hide();

      await createConnection({
        type: 'cordova',
        database: 'mapbiomas_db',
        location: 'default',
        logging: ['error', 'query', 'schema'],
        //synchronize: true,
        entities: [
          Map,
          Survey,
          Marker,
          MediaFileEntity
        ]
      });
      
      this.mediafilesProvider.checkMediaDirs();
      this.rootPage = HomePage;

    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
