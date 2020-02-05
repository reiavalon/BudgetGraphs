import { extraPaymentElem, amortizedElem } from "./types";
import * as _ from 'lodash';
import { getExtraPaymentsForMonth } from './extraPaymentFunctions';

export class AmortizedSchedule {
    private startingPrincipal: number = 0;
    private startDate: Date = new Date();
    private payment: number = 0;
    private apr: number = 0;
    private extraPaymentArray: extraPaymentElem[] = [];
    private periodicExtra: number = 0;
    private oneTimeExtra: number = 0;

    amortizedArray: amortizedElem[] = [];

    get totalInterest(): number {
        return _.sum(this.ipmtArray);
    }

    get payoffDate(): Date {
        let output = _.last(this.amortizedArray);
        if(output) {
            return output.date;
        }
        else {
            return new Date();
        }
    }

    get dateArray(): Date[] {
        return _.map(this.amortizedArray, elem => elem.date);
    }

    get ppmtArray(): number[] {
        return _.map(this.amortizedArray, elem => elem.ppmt);
    }

    get ipmtArray(): number[] {
        return _.map(this.amortizedArray, elem => elem.ipmt);
    }

    get principalArray(): number[] {
        return _.map(this.amortizedArray, elem => elem.principal);
    }

    constructor(startingPrincipal: number, apr: number, startDate: Date, payment: number, extraPaymentArray: extraPaymentElem[]) {
        this.startingPrincipal = startingPrincipal;
        this.startDate = startDate;
        this.payment = payment;
        this.apr = apr;
        this.extraPaymentArray = extraPaymentArray;

        this.updateAmortizedArray();
    }

    setOneTimeExtraPayment(oneTimePayment: number) {
        this.oneTimeExtra = oneTimePayment;
        this.updateAmortizedArray();
    }

    setPeriodicPayment(periodicPayment: number) {
        this.periodicExtra = periodicPayment;
        this.updateAmortizedArray();
    }

    private updateAmortizedArray(): void {
        this.amortizedArray = [];
        let currentPrincipal = this.startingPrincipal;
        let currentDate = new Date(this.startDate);
        currentDate.setDate(1);
        //amortized.push({ date: currentDate, principle: currentPrinciple, ppmt: 0, ipmt: 0, payment: 0, extraPayment: 0 });
    
        let _extraPaymentArray = this.extraPaymentArray.slice(0);
        if(this.oneTimeExtra > 0) {
            let todayDate = new Date();
            todayDate.setDate(1);
            _extraPaymentArray.push({ date: todayDate, amount: this.oneTimeExtra });
        }
    
        while (currentPrincipal > 0) {
            currentDate = new Date(currentDate);
            currentDate.setMonth(currentDate.getMonth() + 1);
            let ipmt = currentPrincipal * (this.apr / 12);
            let ppmt = this.payment - ipmt;
            let extraPayment = (currentDate.getTime() > (new Date()).getTime()) ? this.periodicExtra : 0;
            extraPayment += getExtraPaymentsForMonth(_extraPaymentArray, currentDate);
            ppmt += extraPayment;
            currentPrincipal -= (ppmt);
            let amortizedElem: amortizedElem = {
                date: currentDate,
                principal: currentPrincipal,
                ppmt: ppmt,
                ipmt: ipmt,
                payment: this.payment,
                extraPayment: extraPayment
            }
            this.amortizedArray.push(amortizedElem);
        }
    }
}