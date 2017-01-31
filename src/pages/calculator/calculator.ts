import {Component} from '@angular/core';
import {CountyInfo} from '../../providers/county-info';
import {PortlandMetroInfo} from '../../providers/portland-metro-info';
import {TranslateService} from 'ng2-translate';

export class CountyCalculationItem {
  constructor(public county:string, public hours:number, public rate:number) {
  }
}

@Component({
  selector: 'page-calculator',
  templateUrl: 'calculator.html'
})
export class CalculatorPage {
  public items:CountyCalculationItem[];
  public nextCounty:string;
  public nextHours:number;
  public total:number;
  public earnings:number;
  public highestWageSeen:number;
  public calculationMath:string;
  public totalCashEach:number;
  public totalCashHighest:number;


  public showQ1_1:boolean = false;
  public showQ2:boolean = false;
  public showSummary:boolean = false;
  public answerText:string;

  public showSimpleCalc:boolean = false;
  public hasClickedQ1Yes:boolean = false;
  public hasClickedQ1No:boolean = false;
  public hasClickedQ1aYes:boolean = false;
  public hasClickedQ1aNo:boolean = false;
  public hasClickedQ2Yes:boolean = false;
  public hasClickedQ2No:boolean = false;

  countyNames:string[];

  constructor(public countyInfo:CountyInfo, public portlandMetroInfo:PortlandMetroInfo, public translate:TranslateService) {

    this.items = [];
    this.earnings = 0;
    this.total = 0;
    this.totalCashEach = 0.00;
    this.totalCashHighest = null;
  }

  ionViewDidLoad() {
    this.countyNames = this.countyInfo.getListOfCounties();

    this.countyNames.sort();

    this.countyNames.unshift('PORTLAND METRO');
  }


  removeItem(item) {

    this.calculationMath = '';
    let index = this.items.indexOf(item, 0);
    if (index > -1) {
      this.items.splice(index, 1);
      if (this.items.length > 0) {
        this.calculateIncome();
      } else {
        this.total = 0;
        this.earnings = 0;
        this.highestWageSeen = 0;
        this.totalCashEach = 0.00;
        this.totalCashHighest = null;
      }
    }
  }

  addEntry() {

    if (this.nextCounty && !isNaN(this.nextHours) && (this.nextHours > 0)) {

      // lookup the rate.
      if (this.nextCounty.includes('PORTLAND')) {

        this.items.push(new CountyCalculationItem(this.nextCounty, +this.nextHours, this.portlandMetroInfo.getWage()));

      } else {

        this.items.push(new CountyCalculationItem(this.nextCounty, +this.nextHours, this.countyInfo.getInformationForCounty(this.nextCounty).wage));

      }


      this.calculateIncome();
      this.nextHours = 0;
    }
  }


  answerQ1(isYes) {
    this.showSummary = false;
    this.showSimpleCalc = false;
    this.items = [];

    this.hasClickedQ1aYes = false;
    this.hasClickedQ1aNo = false;
    this.hasClickedQ2Yes = false;
    this.hasClickedQ2No = false;

    if (isYes) {
      this.showQ1_1 = true;
      this.showQ2 = false;
      this.hasClickedQ1No = false;

    } else {
      this.showQ1_1 = false;
      this.showQ2 = true;
      this.hasClickedQ1Yes = false;
    }
  }

  answerQ1_a(isYes) {
    this.showQ2 = false;
    this.showSummary = false;
    this.showSimpleCalc = false;

    this.hasClickedQ2Yes = false;
    this.hasClickedQ2No = false;
    if (isYes) {
      this.showQ2 = false;


      this.hasClickedQ1aNo = false;
      this.translate.get('CALCULATOR-1-SUB2').subscribe((res:string) => {
        this.answerText = res;
        this.showSimpleCalc = true;
        this.nextHours = 0;
        this.totalCashEach = 0;
        this.totalCashHighest = 0;

      });

    } else {
      this.showQ2 = true;
      this.hasClickedQ1aYes = false;

    }
  }

  answerQ2(isYes) {

    this.showSummary = false;

    if (isYes) {

      this.hasClickedQ2No = false;
      this.translate.get('CALCULATOR-2-SUB1').subscribe((res:string) => {
        this.answerText = res;
        this.showSimpleCalc = true;
        this.nextHours = 0;
        this.totalCashEach = 0;
        this.totalCashHighest = 0;
      });

    } else {
      this.items = [];
      this.hasClickedQ2Yes = false;
      this.showSimpleCalc = false;
      this.translate.get('CALCULATOR-2-SUB2').subscribe((res:string) => {
        this.answerText = res;
        this.nextHours = 0;
        this.totalCashEach = 0;
        this.totalCashHighest = 0;
      });

    }
  }

  countyChange(hoursInput) {
    // its annoying but I need to set the focus after the modal for the select has closed but
    // I have no idea how to do that.

    // not working well.  try removing...
    //setTimeout(() => {
    //  hoursInput.setFocus();
    // for android bringing up keyboard manaully
    //  Keyboard.show();

    //}, 400);
  }

  calculateIncome() {

    this.totalCashEach = 0;
    this.totalCashHighest = 0;


    let countyHours = new Map<string,number>();
    let totalHours = 0;

    //let highestCounty = 'na';
    //let highestHours = 0.0;
    let highestWage = 0.0;

    for (let entry of this.items) {

      // previously stored...
      let hours = countyHours.get(entry.county);

      this.totalCashEach += (entry.hours * entry.rate);

      if (entry.rate > highestWage) {
        highestWage = entry.rate;
      }
      if (hours) {
        countyHours.set(entry.county, hours + entry.hours);
      } else {
        countyHours.set(entry.county, entry.hours);
      }

      totalHours = Number(totalHours) + Number(entry.hours);
    }


    // logic to find the highest number.  this is not actually law anymore though....
    /*
     countyHours.forEach((value, key)=> {

     let theHours = Number(value);
     if (theHours === highestHours) {

     if (key.includes('PORTLAND')) {
     highestCounty = key;
     } else if (highestCounty.includes('PORTLAND')) {
     // do nothing...
     } else {
     // select higher rate!!!
     let infoCurrent = this.countyInfo.getInformationForCounty(key);
     let infoOld = this.countyInfo.getInformationForCounty(highestCounty);

     if (infoCurrent.wage > infoOld.wage) {
     highestCounty = key;
     }
     }
     }
     if (theHours > highestHours) {
     highestCounty = key;
     highestHours = theHours;

     }

     });

     let wage = 0;

     if (highestCounty.includes('PORTLAND')) {
     wage = this.portlandMetroInfo.getWage();
     } else {
     wage = this.countyInfo.getInformationForCounty(highestCounty).wage;
     }
     */

    let wage = highestWage;
    this.total = totalHours;
    this.earnings = totalHours * wage;

    this.highestWageSeen = wage;

    this.totalCashHighest = this.earnings;

    if (this.totalCashEach === this.totalCashHighest) {
      this.totalCashHighest = null;
    }
  }

  hoursEntered() {

    this.showSummary = true;
    // this condition is when we are doing the simple calculator.
    if (this.showSimpleCalc) {
      this.items = [];
      this.addEntry();
      this.nextHours = this.total;

      this.calculationMath = 'Total: $' + this.totalCashEach;
    } else {

      this.calculationMath = 'Total: $' + this.totalCashEach;
      if (this.totalCashHighest) {
        this.calculationMath = 'Total: (a) $' + this.totalCashEach;
        this.calculationMath += ' (b) $' + this.totalCashHighest;
      }

    }
  }
}
