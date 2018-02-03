import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

/*
  Generated class for the MediafilesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MediafilesProvider {

  imageDir:string = "image";
  audioDir:string = "audio";

  constructor(private file: File) {
  }


	public checkMediaDirs(){
		this.checkMediaDirectory(this.imageDir);
		this.checkMediaDirectory(this.audioDir);
	}



	public checkMediaDirectory(dirName){
		this.file.checkDir(this.file.externalDataDirectory, dirName).then(success => {
			console.log("Directorio chequeado " + dirName);
		}, error => {
			this.createMediaDir(dirName);
		});
	}



	public createMediaDir(dirName){
		this.file.createDir(this.file.externalDataDirectory, dirName, false).then(success => {
			console.log("Directorio creado: " + this.file.externalDataDirectory + dirName);
		}, error => {
			console.log("Fallo al crear directorio " + dirName);
		})
	}


	public getImageDir(){
		return this.getMediaDir(this.imageDir);
	}

	public getAudioDir(){
		return this.getMediaDir(this.audioDir);
	}


	public getMediaDir(mediaType){
		return this.file.externalDataDirectory + mediaType;
	}

	public getPathForMedia(mediaType, filePath){
		if (filePath === null){
			return '';
		} else {
			return this.file.externalDataDirectory + mediaType + "/" + filePath;
		}
	}


	public createImageFileName() {
	  var d = new Date(),
	  n = d.getTime(),
	  newFileName =  n + ".jpg";
	  return newFileName;
	}

}
