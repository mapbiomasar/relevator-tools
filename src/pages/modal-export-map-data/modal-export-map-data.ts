import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController} from 'ionic-angular';
import { getRepository, getManager, Repository } from 'typeorm';

import { UtilsProvider } from '../../providers/utils/utils';

import { SocialSharing } from '@ionic-native/social-sharing';
import {MediaFileEntity} from "../../entities/mediafileentity";

import { ExportFormatsProvider } from '../../providers/export-formats/export-formats';
import { AppFilesProvider } from '../../providers/appfiles/appfiles';

import {Map} from "../../entities/map";

import tokml from 'tokml';


import { File } from '@ionic-native/file';


declare var Zeep;

@IonicPage()
@Component({
  selector: 'page-modal-export-map-data',
  templateUrl: 'modal-export-map-data.html',
})
export class ModalExportMapDataPage {

  mapEntity: Map;
  mediafilesRepository:any;

  private exportOutputFormat:string = null;

  private exportFileName:string = null;
  private fileExported = null; 
  private fileExportedDataType:string;
  private deleteFileAfterExport:boolean = false;
  private exportDataConfig:any = {};


  private shareSubjectText:string = "MapbiomasApp - Datos";
  private shareBodyText:string = "Este es un archivo generado desde MapbiomasAPP";




  constructor(public navCtrl: NavController, public navParams: NavParams,  public viewCtrl: ViewController, 
              public exportFormats: ExportFormatsProvider,  private appFilesProvider: AppFilesProvider, 
              private socialSharing: SocialSharing,  public loadingCtrl: LoadingController,
              private alertCtrl: AlertController, public platform: Platform,
              private file: File,
              private utils: UtilsProvider) {
      this.mediafilesRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
  		this.mapEntity = navParams.get("mapEntity");
      this.exportDataConfig = {"surveys":{}};
  }

  ionViewDidLoad() {
    
  }


  presentPromptExportData(){
    let alert = this.alertCtrl.create({
      title: 'Exportar datos',
      inputs: [
        {
          name: 'export_filename',
          placeholder: 'Nombre del archivo'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Exportar',
          handler: data => {
            this.exportFileName = (data.export_filename ? data.export_filename : "default_filename");
            var loading = this.loadingCtrl.create({
              content: 'Exportando Mapa...'
            });
            loading.present();
            this.initExportData().then((data) =>{
              if (data){
                  this.saveMapData(data);
              }
              loading.dismiss();
              this.utils.showBasicAlertMessage("Exportar Mapa", "Los datos se exportaron con éxito!");
            })
          }
        }
      ]
    });
    alert.present();
  }

  async initExportData(){
     let markersData = await this.constructMarkersData();
     let schemeData = this.constructSchemeData();
     return {"markers":markersData, "scheme": schemeData};
  }


  private async constructMarkersData(){
    this.fileExported = null;
    if (this.exportOutputFormat){
      	let geoJSONObject = this.exportFormats.getGeoJSONObjectBase();
      	let jsonObject = await this.populateWithMapMarkers(geoJSONObject);
      	console.log(jsonObject);
        let outFileContent = "";
        switch(this.exportOutputFormat){
          case "geojson":
                outFileContent = JSON.stringify(jsonObject);
                break;
          case "kml":
                jsonObject = this.explodeFeaturesProperties(jsonObject);
                console.log("modified!");
                console.log(jsonObject);
                outFileContent = tokml(jsonObject); // tokml retorna string
        }
        return outFileContent;
    }
    return null;
  }


  private constructSchemeData(){
      let mapObjectClone = JSON.parse(JSON.stringify(this.mapEntity)) // deep clone
      for (let i = 0; i < mapObjectClone.surveys.length; i++) {
          let survey = mapObjectClone.surveys[i];
          if (!this.exportDataConfig.surveys[survey.id]){
            mapObjectClone.surveys.splice(i, 1);
            i--;
          }
      }
      return JSON.stringify(mapObjectClone,  (k,v) => (k === 'id')? undefined : v);
  }

  explodeFeaturesProperties(jsonObject){
      for (var x in jsonObject.features){
        var feature = jsonObject.features[x];
        feature.properties.attributes = JSON.parse(feature.properties.attributes);
        for (var attr_key in feature.properties.attributes){
            feature.properties["mapbiomas.attribute_"+attr_key] = feature.properties.attributes[attr_key];
        }
        delete feature.properties.attributes;
        for (var imageIdx in feature.properties.media_files.images){
              feature.properties["mapbiomas.media_file_image_"+imageIdx] = feature.properties.media_files.images[imageIdx];
        }
        for (var audioIdx in feature.properties.media_files.audio){
          feature.properties["mapbiomas.media_file_audio_"+imageIdx] = feature.properties.media_files.audio[audioIdx];
        }
        delete feature.properties.media_files;
      }
      return jsonObject;
  }

  async populateWithMapMarkers(geoJSONObject){
      for(let i in this.mapEntity.surveys){
          let survey = this.mapEntity.surveys[i];
          if (this.exportDataConfig.surveys[survey.id]){
              for (let j in survey.markers){
                  let marker = survey.markers[j];
                  let markerData = await this.getFeatureFromMarker(survey, marker);
                  geoJSONObject.features.push(markerData);
              }
          }
      }
      return geoJSONObject;
  }

  private async getFeatureFromMarker(survey, marker){
    if (!marker.mediaFiles){
      marker.mediaFiles = [];
      const manager = getManager();
        let mediaFiles = await  manager.query(`SELECT * FROM mediafile WHERE markerID = ` + marker.id);
        for (let i = 0; i < mediaFiles.length; ++i){
            var tmpMediafile = this.mediafilesRepository.create(mediaFiles[i]);
            marker.mediaFiles.push(tmpMediafile);
        }
    }
    let markerData =  {
           "type": "Feature",
           "geometry": {
               "type": "Point",
               "coordinates": [marker.lat, marker.lng]
           },
           "properties": {
               "survey_id": survey.id,
               "attributes": marker.attributes,
               "orientation": marker.orientation,
               "media_files": {
                    "images":[],
                    "audio": []
               }
       }
    }
    for (let m in marker.mediaFiles){
      if (marker.mediaFiles[m].tipo == this.appFilesProvider.getImageMediaType()){
            markerData.properties.media_files.images.push(marker.mediaFiles[m].path);
      } else { 
            markerData.properties.media_files.audio.push(marker.mediaFiles[m].path);
      }
    }
    return markerData;
  }

  removeExportedFile(){
      if (this.fileExported != null){
          this.appFilesProvider.removeFile(this.fileExportedDataType, this.fileExported.name).then( result =>{
            this.fileExported = null;
            this.fileExportedDataType = null;
          });
      }
  }


  private shareViaEmail(){
    let self = this;
    this.socialSharing.shareViaEmail(this.shareBodyText, this.shareSubjectText, [''],[''],[''],this.fileExported ).then( () => {
      if (self.deleteFileAfterExport){
          self.appFilesProvider.removeFile(self.appFilesProvider.getExportedDataType(), self.fileExported).then( () => {
          });
      }
    }).catch(() => {
      self.showBasicAlertMessage("Error!", "Ha ocurrido un error mientras se intentaba compartir el archivo");
    })
  }

  private shareData(){
        // Share via email
        let self = this;
        this.socialSharing.share(this.shareBodyText, this.shareSubjectText, this.fileExported).then(() => {
          if (self.deleteFileAfterExport){
            self.appFilesProvider.removeFile(self.appFilesProvider.getExportedDataType(), self.fileExported).then( () => {
            });
        }
        }).catch(() => {
          self.showBasicAlertMessage("Error!", "Ha ocurrido un error mientras se intentaba compartir el archivo");          
        });
  }

  private async saveMapData(data){
        console.log(data);
        var self = this;
        var markersContent = data.markers;
        var markersFilename =  "markers" + this.exportFormats.getFileExtension(this.exportOutputFormat);
        var schemeContent = data.scheme;
        var schemeFilename = "scheme.json";
        await this.appFilesProvider.resetTmpFileDir();
        await this.appFilesProvider.writeFile(this.appFilesProvider.getTmpFileType(), markersFilename, markersContent);
        await this.appFilesProvider.writeFile(this.appFilesProvider.getTmpFileType(), schemeFilename, schemeContent);
        var outputZipFilename = this.appFilesProvider.getAppDir(this.appFilesProvider.getExportedDataType()) + '/' + this.exportFileName + '.zip';
        console.log(this.appFilesProvider.getAppDir(this.appFilesProvider.getExportedDataType()));
        Zeep.zip({
          from:this.appFilesProvider.getTmpFileDir(),
          to: outputZipFilename,
        }, async function(e) {
            console.log('zip success!');
            console.log(outputZipFilename);
            console.log(e);
            self.fileExported = outputZipFilename;
            self.fileExportedDataType = self.appFilesProvider.getTmpFileType();
            await self.appFilesProvider.resetTmpFileDir();
        }, function(e){
          console.log(e);
        }
        )
  }

  private hasOneSurveyActive(){
    for (let i in this.exportDataConfig.surveys){
      if (this.exportDataConfig.surveys[i]){
        return true;
      }
    }
    return false;
  }


  private canInitExport(){
    return this.exportOutputFormat && this.hasOneSurveyActive();
  }

  dismiss() {
    this.viewCtrl.dismiss({
      mapEntity: this.mapEntity
    });
  }

}
