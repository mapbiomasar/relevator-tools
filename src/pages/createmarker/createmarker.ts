import { Component} from '@angular/core';
import { NavController, NavParams,  Platform, ActionSheetController, AlertController, ModalController} from 'ionic-angular';
import { getRepository, getManager, Repository } from 'typeorm';
import { UtilsProvider } from '../../providers/utils/utils';
import { MediafilesProvider } from '../../providers/mediafiles/mediafiles';

// PLUGINS
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation';
import { Toast } from '@ionic-native/toast';


import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';
import { MediaCapture, MediaFile, CaptureError} from '@ionic-native/media-capture';

import {ViewMapPage} from '../viewmap/viewmap';
import {ModalselectsurveyPage} from '../modalselectsurvey/modalselectsurvey';

import {Marker} from "../../entities/marker";
import {Map} from "../../entities/map";
import {Survey} from "../../entities/survey";
import {MediaFileEntity} from "../../entities/mediafileentity";

const MEDIA_FILES_KEY = 'mediaFiles';

@Component({
  selector: 'page-createmarker',
  templateUrl: 'createmarker.html'
})
export class CreateMarkerPage {

	markerRepository:any;
	mediafilesRepository:any;

	mapViewEntity:Map;
	marker:Marker;

	currentSurvey:Survey;

	markerLocalAttributes:{};

	orientationSubscription:any;
	savedOrientation:boolean;

	imageMediaFiles = [];
	audioMediaFiles = [];

	maxImagesNumber:number = 3;
	maxAudiosNumber:number = 1;


  	contextData = {};

	constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, public actionsheetCtrl: ActionSheetController, public alertCtrl: AlertController, private camera: Camera, private deviceOrientation: DeviceOrientation, private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media, private toast: Toast, private utils: UtilsProvider, private mediafilesProvider: MediafilesProvider, private modalController: ModalController) {
			this.markerRepository = getRepository('marker') as Repository<Marker>;
			this.mediafilesRepository = getRepository('mediafile') as Repository<MediaFileEntity>;
			this.mapViewEntity = navParams.get('map');
			// el survey activo es el ultimo creado
			this.marker = navParams.get('marker');
			if (this.marker){
				//this.populateMediaLists();
				this.savedOrientation = true;
				this.markerLocalAttributes = JSON.parse(this.marker.attributes);
			} else {
				this.marker = new Marker();
				this.marker.lat = navParams.get('location')[0];
				this.marker.lng = navParams.get('location')[1];
				this.marker.mediaFiles = [];
				this.marker.creation_date = this.utils.getNowUnixTimestamp();
				this.savedOrientation = false;
				this.markerLocalAttributes = {};
			}
			this.setCurrentSurvey(this.mapViewEntity.surveys[this.mapViewEntity.surveys.length-1]);
			this.marker.survey = this.currentSurvey;
			this.setContextData();
			this.populateMediaLists();
			this.toogleOrientationSubsctription();
	}

	async loadMediaFilesRelations(){
		this.marker.mediaFiles = [];
		const manager = getManager();
    	let mediaFiles = await  manager.query(`SELECT * FROM mediafile WHERE markerID = ` + this.marker.id);
    	for (let i = 0; i < mediaFiles.length; ++i){
	      	var tmpMediafile = this.mediafilesRepository.create(mediaFiles[i]);
      		this.marker.mediaFiles.push(tmpMediafile);
	    }
	    console.log(this.marker);
	}


	// Estamos creando un marcador o editando uno existente?
	private isEditingContext(){
		if (this.markerRepository.hasId(this.marker)){
			return true;
		}
		return false;
	}

	private setContextData(){
		if (this.isEditingContext()){
			this.contextData["title"] = "Editar";
			this.contextData["button_save_text"] = "Actualizar";
		} else {
			this.contextData["title"] = "Nuevo";
			this.contextData["button_save_text"] = "Guardar";
		}
	}


	// Chequea los mediafiles del marker
	// Si no tiene, inicializa el array
	// Si tiene, los divide en dos listas de imagenes y audio
	async populateMediaLists(){
		if (this.isEditingContext() && !this.marker.mediaFiles){ // no se cargaron las relaciones mediafiles del marker
			await this.loadMediaFilesRelations();
		}
		if (this.marker.mediaFiles){
			var i;
			for (i = 0; i < this.marker.mediaFiles.length; ++i) {
    			console.log(this.marker.mediaFiles[i]);
    			this.addMediaEntityToLocalList(this.marker.mediaFiles[i]);
			}
		} else {
			this.marker.mediaFiles = [];
		}
	}

	startOrientationSubscription(){
		this.orientationSubscription = this.deviceOrientation.watchHeading({frequency: 300}).subscribe(
			  (data: DeviceOrientationCompassHeading) => {
			  		this.markerLocalAttributes["orientation"] = data.trueHeading; // trueHeading o magneticHeading (Canadá)? 
		  		}
			);
	}

	stopOrientationSubsctription(){
		if (this.orientationSubscription){
			this.orientationSubscription.unsubscribe();
		}
	}

	toogleOrientationSubsctription(){
		this.savedOrientation = !this.savedOrientation;
		if (this.savedOrientation){
			this.startOrientationSubscription();
		} else {
			this.stopOrientationSubsctription();
		}
	}


	ionViewDidLoad() {
    }


	takePicture(){
		const options: CameraOptions = {
		  quality: 70,
		  destinationType: this.camera.DestinationType.FILE_URI,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  targetWidth: 300, 
		  targetHeight: 300,
		  saveToPhotoAlbum: false
		}

		this.camera.getPicture(options).then((imageData) => {
			var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
      		var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
			this.copyFileToLocalDir(correctPath, currentName, this.mediafilesProvider.createImageFileName(), this.mediafilesProvider.getImageMediaType());
			}, (err) => {
			console.log(err);
		});
	}

	captureAudio() {
		this.mediaCapture.captureAudio().then(
 			(mediaFileArray: MediaFile[]) => {
 				console.log(mediaFileArray);
 				var mediaFile = mediaFileArray[0];
 				console.log(mediaFile);
				var currentName = mediaFile.name;
				var correctPath = mediaFile.fullPath.substr(0, mediaFile.fullPath.lastIndexOf('/') + 1);
				this.copyFileToLocalDir(correctPath, currentName, currentName, this.mediafilesProvider.getAudioMediaType())
 			},
 			(err: CaptureError) => console.error(err)
 		);
  	}

	public getPathForMedia(mediaType, filePath){
		return this.mediafilesProvider.getPathForMedia(mediaType, filePath);
	}

	private addMediaEntityToLocalList(mediaEntity){
		if (mediaEntity.tipo == this.mediafilesProvider.getImageMediaType()){
	    	this.imageMediaFiles.push(mediaEntity);
	    } else if (mediaEntity.tipo == this.mediafilesProvider.getAudioMediaType()){
	    	this.audioMediaFiles.push(mediaEntity);
	    }
	}

	// Copy the image to a local folder
	private copyFileToLocalDir(namePath, currentName, newFileName, mediaType) {
	  this.file.copyFile(namePath, currentName, this.mediafilesProvider.getMediaDir(mediaType), newFileName).then(success => {
	    let newMediaFile = new MediaFileEntity();
	    newMediaFile.tipo = mediaType;
	    newMediaFile.path = newFileName;
	    newMediaFile.marker = this.marker;
	    this.marker.mediaFiles.push(newMediaFile);
	    this.addMediaEntityToLocalList(newMediaFile);
	  }, error => {
	    console.log(error);
	  });
	}


  	play(audioMediaFile) {
	    if (audioMediaFile.path.indexOf('.wav') > -1 || audioMediaFile.path.indexOf('.amr') > -1) {
	      console.log("playing");
	      console.log(this.getPathForMedia(this.mediafilesProvider.getAudioMediaType(), audioMediaFile.path));
	      const audioFile: MediaObject = this.media.create(this.getPathForMedia(this.mediafilesProvider.getAudioMediaType(), audioMediaFile.path));
	      audioFile.play();
	    }
  	}


  	private deleteAllMarkerMediaEntities(){
  		var i;
		for (i = 0; i < this.imageMediaFiles.length; ++i) {
			this.deleteMediaEntity(this.imageMediaFiles[i], i);
		}
		for (i = 0; i < this.audioMediaFiles.length; ++i) {
			this.deleteMediaEntity(this.audioMediaFiles[i], i);
		}
  	}


	deleteMediaEntity(mediaEntity, index){
		if (mediaEntity.tipo == this.mediafilesProvider.getImageMediaType()){
			this.imageMediaFiles.splice(index, 1);
		} else if (mediaEntity.tipo == this.mediafilesProvider.getAudioMediaType()){
			this.audioMediaFiles.splice(index, 1);
		}
		this.mediafilesProvider.removeMediaFiles(mediaEntity); // elimina archivos físicos
		this.mediafilesRepository.remove(mediaEntity);
		this.removeMarkerMediaEntity(mediaEntity);
	}

	removeMarkerMediaEntity(mediaEntity){
		var removeIndex = this.marker.mediaFiles.map(function(item) { return item.id; }).indexOf(mediaEntity.id);
		this.marker.mediaFiles.splice(removeIndex, 1);
	}


  	openMenu() {
		let actionSheet = this.actionsheetCtrl.create({
		title: 'Marcador',
		cssClass: 'action-sheets-basic-page',
		buttons: [
		{
		  text: 'Eliminar marcador',
		  role: 'destructive',
		  icon: !this.platform.is('ios') ? 'trash' : null,
		  handler: () => {
		      this.presentAlertDelete();
		  }
		},
		]
		});
		actionSheet.present();
  	}

  	presentAlertDelete() {
  		if (this.isEditingContext()){ // Solo permitir eliminar si se está editando
			var self = this;
			let alert = this.alertCtrl.create({
			title: 'Eliminar marcador',
			message: '¿Está seguro de que desea eliminar el marcador?. Esta acción eliminará tanto al marcador como a lor archivos de imagen y sonido asociados',
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
			      this.deleteAllMarkerMediaEntities();
			      this.markerRepository.remove(this.marker).then(entity => {
			        self.toast.showShortTop("Marcador eliminado con éxito").subscribe(
			          entity => {
			             self.navCtrl.popToRoot();
			          }   
			        );
			      });
			    }
			  }
			]
			});
			alert.present();
		}
	}


	setCurrentSurvey(survey){
		this.currentSurvey = survey;
		this.marker.survey = survey;
	}

	openModalSelectSurvey(){
		var self = this;
		const modalSurveys = this.modalController.create(ModalselectsurveyPage, {surveys: this.mapViewEntity.surveys, survey_selected: this.currentSurvey});
		modalSurveys.present();

		 modalSurveys.onDidDismiss((data) => {
	      console.log(data);
	      self.setCurrentSurvey(data.survey_selected);
	    });

	}


	getFormattedDate(date){
		return this.utils.getFormattedDate(this.utils.getDateFromUNIX(date));
	}



  	saveMarker(){
	    var self  = this;
	    this.markerRepository.save(this.marker)
	    .then(function(savedMarker) {
	    	console.log(savedMarker);
	    	self.toast.showShortTop("Marcador creado con éxito").subscribe(
	    		toast => {
				    self.navCtrl.popToRoot();
				  }
	    	);
	    	
	    });
  	}


	saveForm(){
	 	this.marker.attributes = JSON.stringify(this.markerLocalAttributes);
	 	this.marker.creation_date = this.utils.getNowUnixTimestamp();
	 	this.saveMarker();
	}


}
