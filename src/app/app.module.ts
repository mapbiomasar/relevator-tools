import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { CreateMapPage } from '../pages/createmap/createmap';
import { ViewMapPage } from '../pages/viewmap/viewmap';
import { DetailMapPage } from '../pages/detailmap/detailmap';
import { MapTabsPage } from '../pages/maptabs/maptabs';
import { CreateMarkerPage } from '../pages/createmarker/createmarker';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    CreateMapPage,
    ViewMapPage,
    DetailMapPage,
    MapTabsPage,
    CreateMarkerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
