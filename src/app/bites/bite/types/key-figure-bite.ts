import { Bite } from './bite';
export class KeyFigureBite extends Bite {
  // HXL Proxy generated: value
  public value: number;

  /**
   * User properties
   */
  // text preceding "value"
  public preText: string;
  // text after "value"
  public postText: string;
  // description of key figure
  public description: string;

  static type(): string {
    return 'key figure';
  }

  constructor(title: string, dataTitle?: string, preText?: string, postText?: string, description?: string) {
    super(title, KeyFigureBite.type());

    this.dataTitle = dataTitle;
    this.preText = preText;
    this.postText = postText;
    this.description = description;

    this.ingredient = {aggregateColumn: null, valueColumn: this.dataTitle};

  }

  public resetBite(): Bite {
    this.value = null;
    return super.resetBite();
  }

  public populateWithHxlProxyInfo(hxlData: any[][], tagToTitleMap): KeyFigureBite {
    super.populateWithHxlProxyInfo(hxlData, tagToTitleMap);
    let hxlTagIndex = this.findHxlTagIndex(this.ingredient.valueColumn, hxlData);

    if ( hxlTagIndex >= 0 ) {
      this.value = hxlData[2][hxlTagIndex];
      this.init = true;
    } else {
      throw `${this.ingredient.valueColumn} not found in hxl proxy response`;
    }
    return this;
  }
}
