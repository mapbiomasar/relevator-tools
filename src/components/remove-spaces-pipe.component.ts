import { Pipe, PipeTransform } from '@angular/core';
/*
 * Takes a string and removes all its spaces
*/
@Pipe({name: 'nospaces'})
export class RemoveSpacesPipe implements PipeTransform {
  transform(value: string): string {
  	if (value){
  		return value.replace(/ /g, '');
  	}
  }
}