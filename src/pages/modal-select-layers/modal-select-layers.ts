import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FileChooser } from '@ionic-native/file-chooser';
import { getRepository, Repository } from 'typeorm';
import { UtilsProvider }  from '../../providers/utils/utils';

import { FilePath } from '@ionic-native/file-path';

import { Diagnostic } from '@ionic-native/diagnostic';

import { AlertController } from 'ionic-angular';

import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import {Map} from "../../entities/map";
import {MapLayer} from "../../entities/maplayer";

import LayerVector from 'ol/layer/vector';
import SourceVector  from 'ol/source/vector';
import KML from 'ol/format/kml';
import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import Stroke from 'ol/style/stroke';
import Text from 'ol/style/text';

@IonicPage()
@Component({
  selector: 'page-modal-select-layers',
  templateUrl: 'modal-select-layers.html',
})
export class ModalSelectLayersPage {

  private mapEntity:Map;
  private mapUIObject:any;
  private mapLayers:any;
  private layerRep;
  private mapRepository;


  private surveyStyles:any;
  private surveyColors:any;

  private mapConfig:any;
  private localTiles:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private fileChooser: FileChooser, private appFilesProvider: AppFilesProvider, public alertCtrl: AlertController,  private filePath: FilePath, private diagnostic: Diagnostic,  private utilsProvider: UtilsProvider) {
    this.mapRepository = getRepository('map') as Repository<Map>;
    this.layerRep = getRepository('maplayer') as Repository<MapLayer>;
    this.mapUIObject = navParams.get("mapUI");
  	this.mapEntity = navParams.get("mapEntity");
    this.mapConfig = navParams.get("mapConfig");
    this.localTiles = navParams.get("localTiles");

    this.surveyStyles = navParams.get("surveyStyles");
    this.surveyColors = this.utilsProvider.getSurveyColors();

  }

  ionViewDidLoad() {
      
  }

  ionViewWillEnter(){
  	this.loadMapSavedLayers();
  }


  loadMapSavedLayers(){
    this.mapLayers = []
  }

  // Inicia proceso para importar archivo. Se deben preguntar por los permisos
  initImportLayer(){
      let self = this;
      this.diagnostic.getPermissionAuthorizationStatus(this.diagnostic.permission.READ_EXTERNAL_STORAGE).then((status) => {
            if (status != this.diagnostic.permissionStatus.GRANTED) {
              this.diagnostic.requestRuntimePermission(this.diagnostic.permission.READ_EXTERNAL_STORAGE).then((data) => {
                self.importLayer();
              })
            } else {
                self.importLayer();
            }
          }, (statusError) => {
          });
  }

  importLayer(){
      this.fileChooser.open()
              .then(uri => this.importLayerFile(uri))
              .catch(e => alert(e));
  }


  importLayerFile(uri){
    var self = this;

    this.filePath.resolveNativePath(uri)
    .then(filePath => {
          var currentName = filePath.substr(filePath.lastIndexOf('/') + 1);
          var correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
          var randomName = this.appFilesProvider.createFileRandomName(".kml");
          this.appFilesProvider.copyFileToLocalDir(correctPath, currentName, randomName, this.appFilesProvider.getFileType())
          .then(result => {
            var newMapLayer = new MapLayer();
            newMapLayer.map = self.mapEntity;
            newMapLayer.tipo = "kml";
            newMapLayer.path = result.name;
            newMapLayer.visible = 1;
            self.presentLayerNamePrompt(newMapLayer);
          }, error => {
            console.log(error);
            alert("Error al importar el archivo");
          });
    })
    .catch(err => console.log(err));

    uri = decodeURIComponent(uri);

  }

  getMapLayerUIByName(name){
      var layer = null;
      this.mapUIObject.getLayers().forEach(function(el) {
          if (el.get('name') === name) {
              layer = el;
          }
      })
    return layer;
  }

  layerChangeVisibility(mapLayerEntity){
      var layerUI = this.getMapLayerUIByName(mapLayerEntity.path);
      if (layerUI){
        layerUI.setVisible(mapLayerEntity.visible);
        // guardo estado en la bd
        mapLayerEntity.visible = (mapLayerEntity.visible) ? 1 : 0;
        this.layerRep.save(mapLayerEntity);
      }
  }

  appendMapUILayer(mapLayerEntity){
    var self = this;
    this.appFilesProvider.getFileContent(mapLayerEntity.path, this.appFilesProvider.getFileType()).then( result => {
        var vectorSource = new SourceVector({
              format: new KML(),
              loader: function(extent, resolution, projection) {
                  vectorSource.addFeatures(
                    vectorSource.getFormat().readFeatures(result));
              }
        });
        var vectorKML = new LayerVector({
          source: vectorSource,
          name: mapLayerEntity.path,
        });
        self.mapUIObject.addLayer(vectorKML);
    });
  }


  presentLayerNamePrompt(mapLayerObject) {
    var self = this;
    let prompt = this.alertCtrl.create({
      title: 'Importar capa',
      message: "Ingrese un nombre para la nueva capa",
      inputs: [
        {
          name: 'name',
          placeholder: 'Nombre de la capa'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Importar',
          handler: data => {
            mapLayerObject.name = data.name;
            self.layerRep.save(mapLayerObject)
                .then(function(savedLayer) {
                    self.appendMapUILayer(savedLayer);
                    self.mapEntity.layers.push(savedLayer);
                }, function(reason) {
                })
          }
        }
      ]
    });
    prompt.present();
  }


  getSurveyColorName(i){
    let name = this.surveyColors[i]['name'];
    return name;
  }


  getSurveyLayerName(survey){
    return "surveyLayer" + survey.id;
  }



  layerLocalVisibility(event, localLayerName){
      this.updateLayerVisibility(localLayerName, event.checked);
  }



  layerSurveyVisibility(event, survey){
    let self = this;
      let markersLayer = this.getMapLayerUIByName("markers_cluster_vector_layer");
      let style = null;
      //markersLayer.setVisible(visible);
      markersLayer.setStyle(
        function(feature) {
              if (!self.mapConfig.layers_config.surveys[feature.values_.features[0].get("survey_id")]){
                style = new Style({})
              } else {
              var size = feature.get('features').length;
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
              }
                return style;
          }
          
        
      );
  }


  updateLayerVisibility(layerName, visible){
      let layer = this.getMapLayerUIByName(layerName);
      if (layer){
        layer.setVisible(visible);
      }
  }

  getSurveyColor(index){
    var position = index % Object.keys(this.surveyColors).length;
    return this.surveyColors[position]["code"];
  }

  async saveMapConfig(){
    this.mapEntity.config = JSON.stringify(this.mapConfig);
    await this.mapRepository.save(this.mapEntity);
  }


  importedLayerClicked(layerObject){
    let alert = this.alertCtrl.create({
      title: 'Eliminar Capa',
      message: '¿Desea eliminar la capa "' + layerObject.name + '"?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            let layerIndex = this.mapEntity.layers.indexOf(layerObject)
            this.mapEntity.layers.splice(layerIndex, 1);
            this.layerRep.remove(layerObject);
            let mapLayerUI = this.getMapLayerUIByName(layerObject.path);
            this.mapUIObject.removeLayer(mapLayerUI);
          }
        }
      ]
    });
    alert.present();
  }



  dismiss() {
    // momento adecuado para guardar la configuracion del mapa
    this.saveMapConfig();
    this.viewCtrl.dismiss({
      mapEntity: this.mapEntity
    });
  }

}
