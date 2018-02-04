import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, ActionSheetController} from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

//import 'ol/ol.css';
import OLMap from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import ScaleLine from 'ol/control/scaleline';
import Feature from 'ol/feature';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import Stroke from 'ol/style/stroke';
import RegularShape from 'ol/style/regularshape';
import Style from 'ol/style/style';
import LayerVector from 'ol/layer/vector';
import SourceVector  from 'ol/source/vector';
import Point from 'ol/geom/point';

import {CreateMarkerPage} from '../createmarker/createmarker';
import {DetailMapPage} from '../detailmap/detailmap';

import {Map} from "../../entities/map";

@Component({
  selector: 'page-viewmap',
  templateUrl: 'viewmap.html'
})
export class ViewMapPage {

	@ViewChild('map') mapElement: ElementRef;
  map: any;
  mapEntity:Map;
  scaleLineControl:any;
  mousePosition:any;
  positionFeature:any;
  geolocLayer:any;
  defaultGeolocZoom:number;
  currentLocation:any;
  mapCrosshair:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, private geolocation: Geolocation) {
    this.mapEntity = navParams.get('map');
    this.defaultGeolocZoom = 15;
	}


	ionViewDidLoad() {
	    // start map,
	    let arg = [-60.0953938, -34.8902802]
      this.map = new OLMap({
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
      this.positionFeature = new Feature({});
      this.positionFeature.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 4
          })
        })
      }));

      this.mapCrosshair = new Feature({});
      this.mapCrosshair.setStyle(new Style({
          image: new RegularShape({
            fill: new Fill({
                color: 'blue'
            }),
            //stroke: new Stroke({color: 'blue', width: 2}),
            points: 4,
            radius1: 15,
            radius2: 1,
            angle: 0
          })
        }));


      this.geolocLayer = new LayerVector({
          map: this.map,
          source: new SourceVector({
            features: [this.positionFeature, this.mapCrosshair]   
          })
      });

      this.mapCrosshair.setGeometry(new Point(this.map.getView().getCenter()));
      let that = this; 
      this.map.getView().on('change:center', function(){ 
          that.mapCrosshair.setGeometry(new Point(that.map.getView().getCenter()));
      });

  	}


  ionViewDidEnter(){
    this.map.updateSize();
    this.map.render();
  }

  openMenu() {
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Mapa',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Ver detalles del mapa',
          icon: !this.platform.is('ios') ? 'information-circle' : null,
          handler: () => {
              this.navCtrl.push(DetailMapPage, {
                    map: this.mapEntity
                });
          }
        }
      ]
    });
    actionSheet.present();
  }


  addNewMarker(){
    this.navCtrl.push(CreateMarkerPage,  {
        map: this.mapEntity,
        location: this.map.getView().getCenter(),
        marker: null
    });
  }


  getCurrentPosition(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.currentLocation = [resp.coords.longitude, resp.coords.latitude];
      this.positionFeature.setGeometry(new Point(this.currentLocation));
      this.map.getView().setCenter(this.currentLocation);
      if (this.map.getView().getZoom() < this.defaultGeolocZoom){
        this.map.getView().setZoom(this.defaultGeolocZoom);
      }

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
