import { Injectable } from '@angular/core';
import { Bite } from '../bite/types/bite';
import { Observable } from 'rxjs';
import { HxlproxyService } from './hxlproxy.service';
import { Logger } from 'angular2-logger/core';
import { BiteLogicFactory } from '../bite/types/bite-logic-factory';

@Injectable()
export class RecipeService {

  constructor(private hxlProxyService: HxlproxyService, private logger: Logger) { }

  // testProcessBite() {
  //   let bite1 = new KeyFigureBite('KF Bite', '#affected+buildings+partially', 'PRE', 'POST', 'descr');
  //   let bite2 = new ChartBite('KF Bite', '#affected+buildings+partially', '#adm1+name');
    // this.myProcessBite(bite1,
    //   'https://test-data.humdata.org/dataset/8b154975-4871-4634-b540-f6c77972f538/resource/3630d818-
    // 344b-4bee-b5b0-6ddcfdc28fc8/download/eed.csv'
    // ).subscribe( (bite: Bite) => {
    //   let ret = JSON.stringify(bite);
    //   this.logger.log(ret);
    //   return ret;
    // });


    // this.myProcessBite(bite2,
    //   'https://test-data.humdata.org/dataset/8b154975-4871-4634-b540-f6c77972f538/resource/3630d818-344b-
    // 4bee-b5b0-6ddcfdc28fc8/download/eed.csv'
    // ).subscribe( (bite: Bite) => {
    //   let ret = JSON.stringify(bite);
    //   this.logger.log(ret);
    //   return ret;
    // });
  //
  //
  //   this.myProcessAll([bite1, bite2],
  //     'https://test-data.humdata.org/dataset/8b154975-4871-4634-b540-f6c77972f538/resource/3630d818-344b-
  // 4bee-b5b0-6ddcfdc28fc8/download/eed.csv'
  //   ).subscribe( (bite: Bite) => this.logger.log(JSON.stringify(bite) ) );
  // }

  myProcessBite(bite: Bite, datasetUrl: string): Observable<Bite> {
    return this.hxlProxyService.populateBite(bite, datasetUrl);
  }

  resetBite(bite: Bite): Bite {
    return BiteLogicFactory.createBiteLogic(bite).resetBite().getBite();
  }

  processAll(bites: Bite[], datasetUrl: string): Observable<Bite> {
    let observables: Observable<Bite>[] = bites.map( bite => this.myProcessBite(bite, datasetUrl) );

    return Observable.concat(...observables);
  }

}
