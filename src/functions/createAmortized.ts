import { amortizedElem, extraPaymentElem } from "./types";
import { getExtraPaymentsForMonth } from "./extraPaymentFunctions";

export function createAmortized(startingPrincipal: number, apr: number,
    startDate: Date, payment: number, extraPaymentArray: extraPaymentElem[] = [], periodicExtra: number = 0): amortizedElem[] {
    let output: amortizedElem[] = [];
    let currentPrincipal = startingPrincipal;
    let currentDate = new Date(startDate);
    currentDate.setDate(1);
    //amortized.push({ date: currentDate, principle: currentPrinciple, ppmt: 0, ipmt: 0, payment: 0, extraPayment: 0 });

    while (currentPrincipal > 0) {
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
        let ipmt = currentPrincipal * (apr / 12);
        let ppmt = payment - ipmt;
        let extraPayment = (currentDate.getTime() > (new Date()).getTime()) ? periodicExtra : 0;
        extraPayment += getExtraPaymentsForMonth(extraPaymentArray, currentDate);
        currentPrincipal -= (ppmt + extraPayment);
        let amortizedElem: amortizedElem = {
            date: currentDate,
            principal: currentPrincipal,
            ppmt: ppmt,
            ipmt: ipmt,
            payment: payment,
            extraPayment: extraPayment
        }
        output.push(amortizedElem);
    }

    return output;
}