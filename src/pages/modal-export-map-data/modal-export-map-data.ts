import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController} from 'ionic-angular';
import { getRepository, getManager, Repository } from 'typeorm';

import { UtilsProvider } from '../../providers/utils/utils';

import {MediaFileEntity} from "../../entities/mediafileentity";

import { ExportFormatsProvider } from '../../providers/export-formats/export-formats';
import { AppFilesProvider } from '../../providers/appfiles/appfiles';
import { FormsProvider }  from '../../providers/forms/forms';


import {Map} from "../../entities/map";

import tokml from 'tokml';


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
  private exportDataConfig:any = {};

  private formsList:any = {};


  constructor(public navCtrl: NavController, public navParams: NavParams,  public viewCtrl: ViewController, 
              public exportFormats: ExportFormatsProvider,  private appFilesProvider: AppFilesProvider, 
              public loadingCtrl: LoadingController,
              private alertCtrl: AlertController, public platform: Platform,
              private utils: UtilsProvider, private formsProvider: FormsProvider) {
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


  getFormsListData(){
    return JSON.stringify(this.formsList,  (k,v) => (k === 'id')? undefined : v);
  }

  async initExportData(){
     let markersData = await this.constructMarkersData();
     let schemeData = await this.constructSchemeData();
     let formsData = this.getFormsListData();
     return {"markers":markersData, "scheme": schemeData, "forms": formsData};
  }


  private async constructMarkersData(){
    this.fileExported = null;
    if (this.exportOutputFormat){
      	let geoJSONObject = this.exportFormats.getGeoJSONObjectBase();
      	let jsonObject = await this.populateWithMapMarkers(geoJSONObject);

        let outFileContent = "";
        switch(this.exportOutputFormat){
          case "geojson":
                outFileContent = JSON.stringify(jsonObject);
                break;
          case "kml":
                jsonObject = this.explodeFeaturesProperties(jsonObject);

                outFileContent = tokml(jsonObject); // tokml retorna string
        }
        return outFileContent;
    }
    return null;
  }


  private async constructSchemeData(){
      let mapObjectClone = JSON.parse(JSON.stringify(this.mapEntity)) // deep clone
      this.formsList = {};
      for (let i = 0; i < mapObjectClone.surveys.length; i++) {
          let survey = mapObjectClone.surveys[i];
          if (!this.exportDataConfig.surveys[survey.id]){
            mapObjectClone.surveys.splice(i, 1);
            i--;
          } else {
            // Almacena el form en otro objeto, y en el survey dejo su id como referencia
            if (survey.form.parent_form){
              await this.formsProvider.loadFormElements(survey.form.parent_form);
            }
            this.formsList[survey.form.id] = survey.form;
            survey.form = survey.form.id;
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

  private async saveMapData(data){
        var self = this;
        var markersContent = data.markers;
        var markersFilename =  "markers" + this.exportFormats.getFileExtension(this.exportOutputFormat);
        var schemeContent = data.scheme;
        var schemeFilename = "scheme.json";
        var formsContent = data.forms;
        var formsFilename = "forms.json";
        await this.appFilesProvider.resetTmpFileDir();
        await this.appFilesProvider.writeFile(this.appFilesProvider.getTmpFileType(), markersFilename, markersContent);
        await this.appFilesProvider.writeFile(this.appFilesProvider.getTmpFileType(), schemeFilename, schemeContent);
        await this.appFilesProvider.writeFile(this.appFilesProvider.getTmpFileType(), formsFilename, formsContent);
        var outputZipFilename = this.appFilesProvider.getAppDir(this.appFilesProvider.getExportedDataType()) + '/' + this.exportFileName + '.zip';
        Zeep.zip({
          from:this.appFilesProvider.getTmpFileDir(),
          to: outputZipFilename,
        }, async function(e) {

            self.fileExported = outputZipFilename;
            self.fileExportedDataType = self.appFilesProvider.getTmpFileType();
            await self.appFilesProvider.resetTmpFileDir();
        }, function(e){
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
