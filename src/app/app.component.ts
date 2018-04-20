import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppFilesProvider } from '../providers/appfiles/appfiles';

import { getRepository, Repository } from 'typeorm';
import { createConnection } from 'typeorm';

import {AppConfig} from "../entities/appConfig";

import {Map} from "../entities/map";
import {MapLayer} from "../entities/maplayer";
import {Survey} from "../entities/survey";
import {Marker} from "../entities/marker";
import {MediaFileEntity} from "../entities/mediafileentity";
import {CustomForm} from "../entities/customForm";
import {CustomFormElement} from "../entities/customFormElement";

import { HomePage } from '../pages/home/home';
import { ConfigPage } from '../pages/config/config';
import { CustomFormsPage } from '../pages/custom-forms/custom-forms';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  connection:any;

  @ViewChild(Nav) nav: Nav;


  rootPage: any;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private appFilesProvider: AppFilesProvider) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Mis mapas', component: HomePage },
      { title: 'Formularios', component: CustomFormsPage },
      { title: 'Configuracion', component: ConfigPage },
    ];

  }

  initializeApp() {

    this.platform.ready().then(async () => {

      this.statusBar.styleDefault();
      //this.splashScreen.hide();

      let connOptions = {
        type: 'cordova',
        database: 'mapbiomasv1_4',
        location: 'default',
        logging: ['error', 'query', 'schema'],
        synchronize: true,
        entities: [
          Map,
          MapLayer,
          Survey,
          Marker,
          MediaFileEntity,
          CustomForm,
          CustomFormElement,
          AppConfig
        ]
      }

      await this.createSchemeDatabase(connOptions);
      
      this.appFilesProvider.checkMediaDirs();
      this.rootPage = HomePage;

      this.showDatabase(false);



    });
  }


  async createSchemeDatabase(connectionOptions){
      await createConnection(connectionOptions).then(connection => {
        this.connection = connection;
    }).catch(async error => {
        connectionOptions.synchronize = false;
        this.connection = await createConnection(connectionOptions);
    })
  }


  async showDatabase(clear){
      let mediaRep = getRepository('mediafile') as Repository<MediaFileEntity>;
      let m = await mediaRep.find();
      console.log(m);
      let media = await mediaRep.find();
      console.log(media);

      let markersRep = getRepository('marker') as Repository<Marker>;
      let ma = await markersRep.find();
      console.log(ma);
      let markers = await markersRep.find();
      console.log(markers);

      let surveyRep = getRepository('survey') as Repository<Survey>;
      let surveys = await surveyRep.find();
      console.log(surveys);
      let lsurveys = await surveyRep.find();
      console.log(lsurveys);

      let layRep = getRepository('maplayer') as Repository<MapLayer>;
      let layers = await layRep.find();
      console.log(layers);

      let mapRep = getRepository('map') as Repository<Map>;
      let map = await mapRep.find();
      console.log(map);

      if (clear){
          mediaRep.clear();
          markersRep.clear();
          surveyRep.clear();
          layRep.clear();
          mapRep.clear();
      }
    }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
