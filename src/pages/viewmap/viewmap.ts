import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Navbar, Platform, ActionSheetController, AlertController, ModalController} from 'ionic-angular';
import { getRepository, getManager, Repository } from 'typeorm';
import { Geolocation } from '@ionic-native/geolocation';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';
import { UtilsProvider }  from '../../providers/utils/utils';

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
import Text from 'ol/style/text';
import RegularShape from 'ol/style/regularshape';
import Style from 'ol/style/style';
import LayerVector from 'ol/layer/vector';
import SourceVector  from 'ol/source/vector';
import Cluster  from 'ol/source/cluster';
import Point from 'ol/geom/point';
import KML from 'ol/format/kml';

import {CreateMarkerPage} from '../createmarker/createmarker';
import {DetailMapPage} from '../detailmap/detailmap';


import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import {Marker} from "../../entities/marker";
import {MediaFileEntity} from "../../entities/mediafileentity";

import {ModalSelectLayersPage} from '../modal-select-layers/modal-select-layers';




@Component({
  selector: 'page-viewmap',
  templateUrl: 'viewmap.html'
})
export class ViewMapPage {


  @ViewChild('navbar') navBar: Navbar;

	//@ViewChild('map') mapElement: ElementRef;
  map: any;
  mapEntity:Map;
  surveySelected:Survey;

  private mapConfigObject:any;

  localTilesDirectories:any;

  scaleLineControl:any;
  mousePosition:any;
  positionFeature:any;
  geolocLayer:any;
  defaultGeolocZoom:number;
  currentLocation:any;
  mapCrosshair:any;

  mapRepository:any;
  markersRepository:any;
  mediaRepository:any;

  mapMarkers:Marker[];

  surveyStyles = {};

  clusterDistance:number = 30;

  watch:any;
  watchGeolocationStatus:string = "idle";

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, 
              public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController, 
              private geolocation: Geolocation,  private modalController: ModalController, 
              private appFilesProvider: AppFilesProvider,
              private utilsProvider: UtilsProvider) {
                
    this.mapRepository = getRepository('map') as Repository<Map>;
    this.markersRepository = getRepository('marker') as Repository<Marker>;
    this.mediaRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
    this.mapEntity = navParams.get('map');
    this.surveySelected = this.mapEntity.surveys[0] || null;
    this.defaultGeolocZoom = 15;
  }
  
  ionViewDidEnter() {
    this.navBar.backButtonClick = () => {
      this.updateMapConfig().then( () => {
        this.navCtrl.pop();
      })
    };

  }


  ionViewDidLoad(){
    this.mapConfigObject = JSON.parse(this.mapEntity.config);
    this.initSurveyData();
  }


  // Carga formulario de cada survey, y chequea config por defecto
  async initSurveyData(){
    for (let k in this.mapEntity.surveys){
      let tmpSurvey = this.mapEntity.surveys[k];
      //let tmpSurveyForm = await this.formsProvider.loadForm(tmpSurvey.form.id);
      //tmpSurvey.form = tmpSurveyForm;
      this.setDefaultSurveyConfig(tmpSurvey);
    }
    /*let formElementsRepository = getRepository('customFormElement') as Repository<CustomFormElement>;
    let elements = await formElementsRepository.find({where:{'formId':this.surveySelected.form.id}});
    this.surveySelected.form.form_elements = elements;*/
  }


  setDefaultSurveyConfig(survey){
      if (!this.mapConfigObject.layers_config.surveys[survey.id]){
          this.mapConfigObject.layers_config.surveys[survey.id] = true;
      }
  }

	ionViewWillEnter() {

      var osm_layer = new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
      this.map = new OLMap({
        target: 'map',
        layers: [
            osm_layer
        ],
        view: new View({
        projection: 'EPSG:4326',
          center: this.mapConfigObject.center,
          zoom: this.mapConfigObject.zoom
        })
      });

      this.map.addControl(new ScaleLine({}));


      // Geolocation objects
      this.positionFeature = new Feature({});
      this.positionFeature.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#00FF00'
          }),
          stroke: new Stroke({
            color: '#000',
            width: 3
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
          let newCenter = this.getCenter();
          that.mapCrosshair.getGeometry().setCoordinates(newCenter);
          //that.mapCrosshair.changed();
      });
      //this.loadMarkersFeatures();
      this.loadLocalTiles();
      this.loadImportedLayers();
  	}


  async loadLocalTiles(){
      this.localTilesDirectories = await this.appFilesProvider.getTilesDirs();

      for (var k in this.localTilesDirectories){
          var tmp_local_osm_layer = new TileLayer({
                source: new XYZ({
                        url: this.localTilesDirectories[k].fullPath + '{z}/{x}/{y}.png'
                }),
                visible: this.mapConfigObject.layers_config.local[this.localTilesDirectories[k].name] || false,
                name: this.localTilesDirectories[k].name
          });
          this.map.addLayer(tmp_local_osm_layer);
      }
      this.loadMarkersFeatures();
  }

  async loadRawSurveyMarkersAndPopulate(survey){
    var markers = [];
    const manager = getManager();
    let surveyMarkers = await  manager.query(`SELECT * FROM marker WHERE surveyID = ` + survey.id);
    for (let i = 0; i < surveyMarkers.length; ++i){
      var tmpMarker = this.markersRepository.create(surveyMarkers[i]);
      tmpMarker.survey = survey;
      markers.push(tmpMarker);
    }
    survey.markers = markers;
    return markers;
  }


  getSurveyColor(index){
    var colors = this.utilsProvider.getSurveyColors();
    var position = index % Object.keys(colors).length;
    return colors[position]["code"];
  }

  async loadMarkersFeatures(){
        var self = this;
        var features = [];
        for (var k in this.mapEntity.surveys){
            var currentSurvey = this.mapEntity.surveys[k];
            this.mapMarkers = await this.loadRawSurveyMarkersAndPopulate(currentSurvey);
            if (this.mapMarkers){
                for (var i = 0; i < this.mapMarkers.length; ++i) {
                    var markerEntity = this.mapMarkers[i];
                    var coordinates = [markerEntity.lat, markerEntity.lng];
                    var newFeature = new Feature({
                        geometry: new Point(coordinates),
                        marker_id: markerEntity.id,
                        survey_id: currentSurvey.id
                    });
                    features.push(newFeature);
                    //features[i] = newFeature;
                }
            }
        }
        var source = new SourceVector({
          features: features,
        });
        var clusterSource = new Cluster({
          distance: this.clusterDistance,
          source: source,
          name: "markers_cluster_source_layer"
        });
        var styleCluster = null;
        var clusters = new LayerVector({
          source: clusterSource,
          name:"markers_cluster_vector_layer",
          style: function(feature) {
            var size = feature.get('features').length;
            var style = (size > 1) ? styleCluster : self.surveyStyles[feature.values_.features[0].get("survey_id")];
            if (!style) {
              var circleColor = (size > 1) ? '#FFC100' : self.getSurveyColor(feature.values_.features[0].get("survey_id"));
              style = new Style({
                image: new Circle({
                  radius: 10,
                  stroke: new Stroke({
                    color: '#fff'
                  }),
                  fill: new Fill({
                    color: circleColor
                  })
                }),
                text: new Text({
                  text: (size > 1) ? size.toString() : "+",
                  fill: new Fill({
                    color: '#fff'
                  })
                })
              });
              if (size > 1){
                  styleCluster = style;
              } else {
                  self.surveyStyles[feature.values_.features[0].get("survey_id")] = style;
              }
            }
            return style;
          }
        });
        this.map.addLayer(clusters);
        this.map.on('click', function(evt) {
          var feature = self.map.forEachFeatureAtPixel(evt.pixel,
              function(feature) {
                return feature;
              }, {
                hitTolerance: 10
              });
          if (feature && feature.values_.features && feature.values_.features.length == 1) {
              var clickedMarkerID = feature.values_.features[0].get("marker_id");
              self.showAlertViewMarker(clickedMarkerID);
          }
          });
  }

 

  loadImportedLayers(){
    var self = this;
    for (var k in this.mapEntity.layers){
    var layer = this.mapEntity.layers[k];
    this.appFilesProvider.getFileContent(layer.path, this.appFilesProvider.getFileType()).then( result => {
        var vectorSource = new SourceVector({
              format: new KML(),
              loader: function(extent, resolution, projection) {
                  vectorSource.addFeatures(
                    vectorSource.getFormat().readFeatures(result));
              }
        });
        var vectorKML = new LayerVector({
          source: vectorSource,
          name: layer.path,
          visible: layer.visible,
        });

        self.map.addLayer(vectorKML);
    });
    }
   
  }



  async showAlertViewMarker(markerID){
    var marker = await this.markersRepository.findOneById(markerID, {relations:["survey", "survey.form"]});
    if (marker){
      var self = this;
      let actionSheet = this.actionsheetCtrl.create({
      title: 'Marcador',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Ver/Editar datos',
          icon: !this.platform.is('ios') ? 'information-circle' : null,
          handler: () => {
              this.navCtrl.push(CreateMarkerPage, {
                    map: self.mapEntity,
                    marker: marker
                });
          }
        }
      ]
      });
      actionSheet.present();
    }
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
              this.updateMapConfig();
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
    this.updateMapConfig();
    this.navCtrl.push(CreateMarkerPage,  {
        map: this.mapEntity,
        location: this.map.getView().getCenter(),
        marker: null
    });
  }


  toggleWatchPosition(){
    if (this.watchGeolocationStatus == 'idle'){
      this.watchGeolocationStatus = 'active';
      let firstTimeWatch = true;
      this.watch = this.geolocation.watchPosition().subscribe((data) => {
        this.currentLocation = [data.coords.longitude, data.coords.latitude];
        this.positionFeature.setGeometry(new Point(this.currentLocation));
        if (firstTimeWatch){
          this.map.getView().setCenter(this.currentLocation);
          if (this.map.getView().getZoom() < this.defaultGeolocZoom){
            this.map.getView().setZoom(this.defaultGeolocZoom);
          }
          firstTimeWatch = false;
        }
      })
    } else {
      this.watch.unsubscribe();
      this.watchGeolocationStatus = 'idle';
    }
  }

  

  getWatchStatusColor(){
    return (this.watchGeolocationStatus == 'idle') ? 'primary' : 'secondary'; 
  }
   


  showMapLayersManager(){
    const modalLayers = this.modalController.create(ModalSelectLayersPage, {
        mapEntity: this.mapEntity,
        mapUI: this.map,
        mapConfig: this.mapConfigObject,
        localTiles: this.localTilesDirectories,
        surveyStyles: this.surveyStyles
    });
    modalLayers.present();

     modalLayers.onDidDismiss((data) => { // data recibe mapa
        //self.loadImportedLayers();
      });

  }


  showSurveysSwitcher(){
  }

  ionViewWillLeave(){
      this.map.setTarget(null);
      if (this.watchGeolocationStatus == 'active'){
          this.watch.unsubscribe();
          this.watchGeolocationStatus = 'idle';
      }
  }


  async updateMapConfig(){
    if (this.mapRepository.hasId(this.mapEntity)){
      this.mapConfigObject.center = this.map.getView().getCenter();
      this.mapConfigObject.zoom = this.map.getView().getZoom();
      this.mapEntity.config = JSON.stringify(this.mapConfigObject);
      // save new config
      await this.mapRepository.save(this.mapEntity);
    }
  }

  getMapLayerUIByName(name){
    var layer = null;
    this.map.getLayers().forEach(function(el) {
        if (el.get('name') === name) {
            layer = el;
        }
    })
  return layer;
}

}
