import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MediafilesProvider } from '../providers/mediafiles/mediafiles';
import { getRepository, Repository } from 'typeorm';

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

      //this.clearDatabase();

    });
  }


  async clearDatabase(){
      let mediaRep = getRepository('mediafile') as Repository<MediaFileEntity>;
      let m = await mediaRep.find();
      console.log(m);
      mediaRep.clear();
      let media = await mediaRep.find();
      console.log(media);

      let markersRep = getRepository('marker') as Repository<Marker>;
      let ma = await markersRep.find();
      console.log(ma);
      markersRep.clear();
      let markers = await markersRep.find();
      console.log(markers);

      let surveyRep = getRepository('survey') as Repository<Survey>;
      let surveys = await surveyRep.find();
      console.log(surveys);
      surveyRep.clear();
      let lsurveys = await surveyRep.find();
      console.log(lsurveys);

      let mapRep = getRepository('map') as Repository<Map>;
      mapRep.clear();
    }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
