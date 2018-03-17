import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { getRepository, Repository } from 'typeorm';

import { ConfigProvider }  from '../../providers/config/config';

import {CustomForm} from "../../entities/customForm";

@Component({
  selector: 'page-config',
  templateUrl: 'config.html'
})
export class ConfigPage {

  formRepository: any;
  formsList:CustomForm[] = [];

  defaultFormSelected:number = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, private configProvider: ConfigProvider) {
  	this.formRepository = getRepository('customForm') as Repository<CustomForm>;
  	this.getFormsList();
  }


	ionViewDidLoad() {
		this.loadConfig();
	}

	async loadConfig(){
		let config = await this.configProvider.getAppConfig();
		this.defaultFormSelected = config.default_form;
	}

	async defaultFormInitChange(newForm){
		let config = await this.configProvider.getAppConfig();
		config.default_form = newForm;
		this.configProvider.saveConfig(config);
	}

	async getFormsList(){
		let forms = await this.formRepository.find();
		if (forms){
		    this.formsList = forms;
		}
	}


}
