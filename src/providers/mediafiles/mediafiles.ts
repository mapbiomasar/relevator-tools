import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

/*
  Generated class for the MediafilesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MediafilesProvider {

  imageMediaType:string = "image";
  audioMediaType:string = "audio";

  constructor(private file: File) {
  }


	public checkMediaDirs(){
		this.checkMediaDirectory(this.imageMediaType);
		this.checkMediaDirectory(this.audioMediaType);
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

	// Remove media files
	removeMediaFiles(mediaEntity){
		console.log("removing file" + this.getMediaDir(mediaEntity.tipo) + ", " + mediaEntity.path);
		this.file.removeFile(this.getMediaDir(mediaEntity.tipo), mediaEntity.path);
	}


	public getImageDir(){
		return this.getMediaDir(this.imageMediaType);
	}

	public getAudioDir(){
		return this.getMediaDir(this.audioMediaType);
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

	public getImageMediaType(){
		return this.imageMediaType;
	}

	public getAudioMediaType(){
		return this.audioMediaType;
	}


}
