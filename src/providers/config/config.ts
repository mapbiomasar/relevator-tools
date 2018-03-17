import { Injectable } from '@angular/core';

import { getRepository, Repository } from 'typeorm';

import {AppConfig} from "../../entities/appConfig";

@Injectable()
export class ConfigProvider {

  appConfigRepository:any;

  constructor() {
  	this.appConfigRepository = getRepository('appconfig') as Repository<AppConfig>;
  }


  async getAppConfig(){
  	let config = await this.appConfigRepository.findOne();
  	if (!config){
  		config = new AppConfig();
  		this.appConfigRepository.save(config);
  	}
  	return config;
  }


  async saveConfig(config){
  	await this.appConfigRepository.save(config);
  }

}
