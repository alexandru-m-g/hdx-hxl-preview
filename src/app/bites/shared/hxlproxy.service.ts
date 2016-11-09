import { Injectable } from '@angular/core';
import { Logger } from 'angular2-logger/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/mergeMap';
import { Observable, AsyncSubject } from 'rxjs';
import { ChartTransformer } from './hxlproxy-transformers/chart-transformer';
import { Bite } from '../bite/types/bite';
import { AbstractHxlTransformer } from './hxlproxy-transformers/abstract-hxl-transformer';
import { AppConfigService } from '../../shared/app-config.service';

@Injectable()
export class HxlproxyService {

  private tagToTitleMap;
  private metaRows: string[][];
  private hxlFileUrl: string;

  constructor(private logger: Logger, private http: Http, private appConfig: AppConfigService) {}
  // constructor(private logger: Logger, private http: Http) {
    // let observable = this.getMetaRows('https://test-data.humdata.org/dataset/' +
    //   '8b154975-4871-4634-b540-f6c77972f538/resource/3630d818-344b-4bee-b5b0-6ddcfdc28fc8/download/eed.csv');
    // observable.subscribe( this.testResponse.bind(this) );
    // this.getDataForBite({type: 'chart', groupByTags: ['#adm1+name', '#adm1+code'], valueTag: '#affected+buildings+partially'});
  // }

  fetchMetaRows(hxlFileUrl: string): Observable<string [][]> {
    this.hxlFileUrl = hxlFileUrl;

    let myObservable: Observable<string[][]>;
    if (this.metaRows) {
      this.logger.log('Using cached metarows');
      let mySubject = new AsyncSubject<string[][]>();
      mySubject.next(this.metaRows);
      mySubject.complete();
      myObservable = mySubject;
    } else {
      myObservable = this.makeCallToHxlProxy<string[][]>([{key: 'max-rows', value: '0'}], this.processMetaRowResponse);
    }
    return myObservable;
  }

  populateBite(bite: Bite, hxlFileUrl: string): Observable<any> {
    return this.fetchMetaRows(hxlFileUrl).flatMap(
      (metarows: string[][]) => {
        let transformer: AbstractHxlTransformer;
        switch (bite.type) {
          default:
            transformer = new ChartTransformer(bite);
            break;
        }
        let recipesStr = transformer.buildRecipes();
        this.logger.log(recipesStr);

        return this.makeCallToHxlProxy<Bite>([{key: 'recipe', value: recipesStr}],
          (response: Response) => bite.populateWithHxlProxyInfo(response.json(), this.tagToTitleMap)
        );
      }
    );
  }


  private makeCallToHxlProxy<T>(params: {key: string, value: string}[],
                             mapFunction: (response: Response) => T): Observable<T> {

    // let myMapFunction: (response: Response) => T;
    // if (mapFunction) {
    //   myMapFunction = mapFunction;
    // } else {
    //   myMapFunction = (response: Response) => response.json();
    // }

    let url = `${this.appConfig.get('hxlProxy')}?url=${encodeURIComponent(this.hxlFileUrl)}`;
    if (params) {
      for (let i = 0; i < params.length; i++) {
        url += '&' + params[i].key + '=' + encodeURIComponent(params[i].value);
      }
    }
    this.logger.log('The call will be made to: ', url);
    return this.http.get(url).map(mapFunction.bind(this)).catch(err => this.handleError(err));
  }

  private processMetaRowResponse(response: Response): string[][] {
    let ret = response.json();

    // let ret = [json[0], json[1]];
    this.logger.log('Response is: ' + ret);
    this.metaRows = ret;

    this.tagToTitleMap = {};
    if (ret.length === 2) {
      for (let i = 0; i < ret[1].length; i++) {
        this.tagToTitleMap[ret[1][i]] = ret[0][i];
      }
    } else {
      throw 'There should be 2 meta rows';
    }

    return ret;
  }

  // private testResponse(result) {
  //   this.logger.log('Test response is: ' + result);
  // }

  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    this.logger.error(errMsg);
    return Observable.throw(errMsg);
  }

}
