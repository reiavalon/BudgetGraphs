import { extraPaymentElem } from "./types";
import * as _ from 'lodash';

export function advanceDateByMonth(date: Date, months: number): Date {
    let output = new Date(date);
    output.setMonth(output.getMonth() + months);
    return output;
}

export function getExtraPaymentsForMonth(extraPaymentArray: extraPaymentElem[], date: Date) {
    let filteredArray = _.filter(extraPaymentArray, (elem: extraPaymentElem) => {
        return (date.getMonth() === elem.date.getMonth()) && (date.getFullYear() === elem.date.getFullYear());
    });
    return _.reduce(filteredArray, (sum: number, elem: extraPaymentElem) => {
        return sum + elem.amount;
    }, 0);
}