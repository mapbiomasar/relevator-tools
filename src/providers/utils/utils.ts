import { Injectable } from '@angular/core';
import {AlertController} from 'ionic-angular';
@Injectable()
export class UtilsProvider {


  surveyColors = [
    {"name":"primary", "code":"#488aff"},
    {"name":"energized", "code":"#ffc527"},
    {"name":"danger", "code":"#f53d3d"},
  ]

  constructor( private alertCtrl: AlertController) {
  }


  // Recibe unix timestamp en segundos y retorna string date
  getDateFromUNIX(intTimestamp){
  	return new Date(intTimestamp * 1000);
  }

  getFormattedDate(date){
    var year = date.getFullYear();
    var month =('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    if (hh < 10) {hh = "0"+hh;}
    if (mm < 10) {mm = "0"+mm;}
    if (ss < 10) {ss = "0"+ss;}
    var t = day+"/"+month+"/"+year+" "+hh+":"+mm+":"+ss;
    return t;
  }


  // retorna timestamp unix ("now") en segundos
  getNowUnixTimestamp(){
  	return Date.now() / 1000;
  }


  getSurveyColors(){
    return this.surveyColors;
  }


  showBasicAlertMessage(title, subtitle){
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: subtitle,
      buttons: ['OK']
    });
    alert.present();
  }

}
