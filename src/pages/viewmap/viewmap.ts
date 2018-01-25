import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController} from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

//import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import ScaleLine from 'ol/control/scaleline';
import MousePosition from 'ol/control/mouseposition';
import Coordinate from 'ol/coordinate';
import Feature from 'ol/feature';
import ol from 'ol';
//import Style from 'ol/style';
//import Circle from 'ol/style';
//import Fill from 'ol/style';
//import Stroke from 'ol/style';


import {CreateMarkerPage} from '../createmarker/createmarker';
import {DetailMapPage} from '../detailmap/detailmap';

@Component({
  selector: 'page-viewmap',
  templateUrl: 'viewmap.html'
})
export class ViewMapPage {

	@ViewChild('map') mapElement: ElementRef;
  map: any;
  scaleLineControl:any;
  mousePosition:any;
  positionFeature:any;
  geolocLayer:any;
  defaultGeolocZoom:number;
  currentLocation:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, private geolocation: Geolocation) {
    this.defaultGeolocZoom = 10;
	}


	ionViewDidLoad() {
	    // start map,
	    let arg = [-60.0953938, -34.8902802]

      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
        projection: 'EPSG:4326',
          center: arg,
          zoom: 4
        })
      });

      // Controls
      this.scaleLineControl = new ScaleLine({});
      this.map.addControl(this.scaleLineControl);


      // Geolocation objects
      /*this.positionFeature = new Feature({});
      this.positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#3399CC'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
          })
        })
      }));
      this.geolocLayer = new ol.layer.Vector({
          map: this.map,
          source: new ol.source.Vector({
            features: [this.positionFeature]
          })
      })*/

  	}

  openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mapa',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Información del mapa',
          icon: !this.platform.is('ios') ? 'information-circle' : null,
          handler: () => {
              this.navCtrl.push(DetailMapPage, {
                  
                });
          }
        }
      ]
    });
    actionSheet.present();
  }


  addNewMarker(){
    console.log(this.map.getView().getCenter());
    this.navCtrl.push(CreateMarkerPage,  {
        location: this.map.getView().getCenter()
    });
  }


  getCurrentPosition(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.currentLocation = [resp.coords.longitude, resp.coords.latitude];
      this.map.getView().setCenter(this.currentLocation);
      if (this.map.getView().getZoom() < this.defaultGeolocZoom){
        this.map.getView().setZoom(this.defaultGeolocZoom);
      }

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
