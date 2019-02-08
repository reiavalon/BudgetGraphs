import Plotly from 'plotly.js';

export interface amortizedElem {
    date: Date,
    principal: number,
    ppmt: number,
    ipmt: number,
    payment: number,
    extraPayment: number
};

export interface extraPaymentElem {
    date: Date;
    amount: number;
}

export interface chartType {
    uuid: string;
    traces: Partial<Plotly.PlotData>[];
    layout: Partial<Plotly.Layout>;
}