import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

@Injectable()
export class AppFilesProvider {

  imageMediaType:string = "image";
  audioMediaType:string = "audio";
  fileType:string = "files";
  exportedDataType:string = "exported";
  tileFileType:string = "tiles";

  constructor(private file: File) {
  }


	public checkMediaDirs(){
		this.checkAppDirectory(this.imageMediaType);
		this.checkAppDirectory(this.audioMediaType);
		this.checkAppDirectory(this.fileType);
		this.checkAppDirectory(this.exportedDataType);
		this.checkAppDirectory(this.tileFileType);
	}



	public checkAppDirectory(dirName){
		this.file.checkDir(this.file.externalDataDirectory, dirName).then(success => {
			
		}, error => {
			this.createAppDir(dirName);
		});
	}



	public createAppDir(dirName){
		this.file.createDir(this.file.externalDataDirectory, dirName, false).then(success => {
			console.log("Directorio creado: " + this.file.externalDataDirectory + dirName);
		}, error => {
			console.log("Fallo al crear directorio " + dirName);
		})
	}

	// Remove media files
	removeMediaFiles(mediaEntity){
		console.log("removing file" + this.getAppDir(mediaEntity.tipo) + ", " + mediaEntity.path);
		this.file.removeFile(this.getAppDir(mediaEntity.tipo), mediaEntity.path);
	}


	public getImageDir(){
		return this.getAppDir(this.imageMediaType);
	}

	public getAudioDir(){
		return this.getAppDir(this.audioMediaType);
	}

	public getFileDir(){
		return this.getAppDir(this.fileType);
	}

	public getExportDir(){
		return this.getAppDir(this.exportedDataType);
	}


	public getTileFileDir(){
		return this.getAppDir(this.tileFileType);
	}


	public getAppDir(mediaType){
		return this.file.externalDataDirectory + mediaType;
	}


	public getImageMediaType(){
		return this.imageMediaType;
	}

	public getAudioMediaType(){
		return this.audioMediaType;
	}

	public getExportedDataType(){
		return this.exportedDataType;
	}

	public getFileType(){
		return this.fileType;
	}

	public getPathForMedia(mediaType, filePath){
		if (filePath === null){
			return '';
		} else {
			return this.file.externalDataDirectory + mediaType + "/" + filePath;
		}
	}


	public createImageFileName() {
	  return this.createFileRandomName(".jpg");
	}

	public createFileRandomName(extension) {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < 16; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text + extension;
	}

	public copyFileToLocalDir(namePath, currentName, newFileName, fileType) {
	  	return this.file.copyFile(namePath, currentName, this.getAppDir(fileType), newFileName)
	}


	public getFileContent(filePath, fileType){
		console.log("READING");
		return this.file.readAsText(this.getAppDir(fileType), filePath)
	}


	public async getTilesDirs(){
		let localTilesDirs = await this.getTilesDirectoryContent();
		let dirs = [];
		for (var i in localTilesDirs){
			if (localTilesDirs[i].isDirectory){
				dirs.push({"name": localTilesDirs[i].name, "fullPath":localTilesDirs[i].nativeURL});
			}
		}
		return dirs;
	}


	getTilesDirectoryContent(){
		return this.file.listDir(this.file.externalDataDirectory, this.tileFileType);
	}


	public writeFile(fileType, fileName, content, replaceFile = true){
		return this.file.writeFile(this.getAppDir(fileType), fileName, content, {replace:replaceFile});
	}


	public removeFile(fileType, fileName){
		return this.file.removeFile(this.getAppDir(fileType), fileName);
	}


}
