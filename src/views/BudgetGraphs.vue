<template>
    <div>
        <div id="paymentsGraph" />
        <div id="principalGraph" />
        <div class="row">
            <slider class="col" title="Extra Periodic" @value-changed="onPeriodicChanged"/>
            <slider class="col" title="Extra OneTime" @value-changed="onOneTimeChanged"/>
        </div>

        <div class="row">
            <div class="col"></div>
            <div class="col">Interest</div>
            <div class="col">Interest Difference</div>
            <div class="col">Payoff Date</div>
        </div>
        <div class="row">
            <div class="col">Base</div>
            <div class="col">{{baseInterest}}</div>
            <div class="col">-</div>
            <div class="col">{{basePayoffDate}}</div>
        </div>
        <div class="row">
            <div class="col">Current</div>
            <div class="col">{{currentInterest}}</div>
            <div class="col">{{(baseInterest - baseInterest).toFixed(2)}}</div>
            <div class="col">{{currentPayoffDate}}</div>
        </div>
        <div class="row">
            <div class="col">Periodic</div>
            <div class="col">{{periodicInterest}}</div>
            <div class="col">{{(baseInterest - periodicInterest).toFixed(2)}}</div>
            <div class="col">{{periodicPayoffDate}}</div>
        </div>
        <div class="row">
            <div class="col">One Time</div>
            <div class="col">{{oneTimeInterest}}</div>
            <div class="col">{{(baseInterest - oneTimeInterest).toFixed(2)}}</div>
            <div class="col">{{oneTimePayoffDate}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Slider from '@/components/Slider.vue';
import { extraPaymentElem, amortizedElem, chartType } from '@/functions/types';
import { advanceDateByMonth } from '@/functions/extraPaymentFunctions';
import { createAmortized } from '@/functions/createAmortized';
import Plotly from 'plotly.js';
import * as _ from 'lodash';

@Component({
  components: {
    Slider
  },
})
export default class BudgetGraphs extends Vue {

    private principal = 188000.00;
    private apr = 0.0375;
    private startDate = new Date();
    private payment = 870.66;

    private uuid = 0;

    private baseAmortized: amortizedElem[] = [];
    private modifiedAmortized: amortizedElem[] = [];
    private periodicModifiedAmortized: amortizedElem[] = [];
    private oneTimeModifiedAmortized: amortizedElem[] = [];

    private _extraPaymentArray: extraPaymentElem[] = [];

    private base_ppmtTrace: any = {};
    private base_ipmtTrace: any = {};
    private base_principalTrace: any = {};

    private modified_ppmtTrace: any = {};
    private modified_ipmtTrace: any = {};
    private modified_principalTrace: any = {};

    private periodic_ppmtTrace: any = {};
    private periodic_ipmtTrace: any = {};
    private periodic_principalTrace: any = {};

    private oneTime_ppmtTrace: any = {};
    private oneTime_ipmtTrace: any = {};
    private oneTime_principalTrace: any = {};

    private currentPeriodic: number = 0;
    private currentOneTime: number = 0;

    private layout: any = {};

    interestCalc(sum: number, elem: amortizedElem) {
        return (sum + elem.ipmt);
    }

    private getPayout(amortized: amortizedElem[]): string {
        let lastDateEntry = _.last(amortized);
        if(lastDateEntry) {
            return lastDateEntry.date.toDateString();
        }
        else {
            return '';
        }
    }

    get baseInterest(): string {
        return _.reduce(this.baseAmortized, this.interestCalc, 0).toFixed(2);
    }
    get basePayoffDate(): string {
        return this.getPayout(this.baseAmortized);
    }

    get currentInterest(): string {
        return _.reduce(this.modifiedAmortized, this.interestCalc, 0).toFixed(2);
    }
    get currentPayoffDate(): string {
        return this.getPayout(this.baseAmortized);
    }

    get periodicInterest(): string {
        return _.reduce(this.periodicModifiedAmortized, this.interestCalc, 0).toFixed(2);
    }
    get periodicPayoffDate(): string {
        return this.getPayout(this.periodicModifiedAmortized);
    }

    get oneTimeInterest(): string {
        return _.reduce(this.oneTimeModifiedAmortized, this.interestCalc, 0).toFixed(2);
    }
    get oneTimePayoffDate(): string {
        return this.getPayout(this.oneTimeModifiedAmortized);
    }

    mounted() {
        this._extraPaymentArray = []

        this.startDate.setDate(27);
        this.startDate.setMonth(10-1);
        this.startDate.setFullYear(2017);

        this.baseAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment);
        this.modifiedAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment, this._extraPaymentArray);
        this.periodicModifiedAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment, this._extraPaymentArray, 0);
        this.oneTimeModifiedAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment, this._extraPaymentArray, 0);

        this.base_ppmtTrace = {
            type: "scatter",
            name: 'Principle Payment',
            x: _.map(this.baseAmortized, row => row.date),
            y: _.map(this.baseAmortized, row => row.ppmt),
        };

        this.base_ipmtTrace = {
            type: "scatter",
            name: "Interest Payment",
            x: _.map(this.baseAmortized, row => row.date),
            y: _.map(this.baseAmortized, row => row.ipmt),
        };

        this.base_principalTrace = {
            type: "scatter",
            name: "Total Principal",
            x: _.map(this.baseAmortized, row => row.date),
            y: _.map(this.baseAmortized, row => row.principal)
        };

        this.modified_ppmtTrace = {
            type: "scatter",
            name: "Modified Principal Payment",
            x: _.map(this.modifiedAmortized, row => row.date),
            y: _.map(this.modifiedAmortized, row => row.ppmt)
        };

        this.modified_ipmtTrace = {
            type: "scatter",
            name: "Modified Interest Payment",
            x: _.map(this.modifiedAmortized, row => row.date),
            y: _.map(this.modifiedAmortized, row => row.ipmt),
        };

        this.modified_principalTrace = {
            type: "scatter",
            name: "Modified Total Principal",
            x: _.map(this.modifiedAmortized, row => row.date),
            y: _.map(this.modifiedAmortized, row => row.principal)
        };

        this.periodic_ppmtTrace = {
            type: "scatter",
            name: "Periodic Principal Payment",
            x: [],
            y: []
        };

        this.periodic_ipmtTrace = {
            type: "scatter",
            name: "Periodic Interest Payment",
            x: [],
            y: [],
        };

        this.periodic_principalTrace = {
            type: "scatter",
            name: "Periodic Total Principal",
            x: [],
            y: []
        };

        this.oneTime_ppmtTrace = {
            type: "scatter",
            name: "Periodic Principal Payment",
            x: [],
            y: []
        };

        this.oneTime_ipmtTrace = {
            type: "scatter",
            name: "Periodic Interest Payment",
            x: [],
            y: [],
        };

        this.oneTime_principalTrace = {
            type: "scatter",
            name: "Periodic Total Principal",
            x: [],
            y: []
        };

        this.layout = {
            title: 'Amortized Schedule'
        };

        this.updateGraphs();
    }

    private updateGraphs() {
        Plotly.react('paymentsGraph', 
            [this.base_ppmtTrace, this.base_ipmtTrace, this.modified_ppmtTrace, this.modified_ipmtTrace, this.periodic_ppmtTrace, this.periodic_ipmtTrace, this.oneTime_ppmtTrace, this.oneTime_ipmtTrace], this.layout);
        Plotly.react('principalGraph',
            [this.base_principalTrace, this.modified_principalTrace, this.periodic_principalTrace, this.oneTime_principalTrace], this.layout);
    }

    private onPeriodicChanged(input: number) {
        this.periodicModifiedAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment, this._extraPaymentArray, input);

        this.periodic_ppmtTrace.x = _.map(this.periodicModifiedAmortized, row => row.date);
        this.periodic_ppmtTrace.y = _.map(this.periodicModifiedAmortized, row => row.ppmt);

        this.periodic_ipmtTrace.x = _.map(this.periodicModifiedAmortized, row => row.date);
        this.periodic_ipmtTrace.y = _.map(this.periodicModifiedAmortized, row => row.ipmt);

        this.periodic_principalTrace.x = _.map(this.periodicModifiedAmortized, row => row.date);
        this.periodic_principalTrace.y = _.map(this.periodicModifiedAmortized, row => row.principal);

        this.updateGraphs();
    }

    private onOneTimeChanged(input: number) {
        let newExtraPaymentsArray = this._extraPaymentArray.slice(0);
        let newDate = (new Date());
        newDate.setDate(1);
        newExtraPaymentsArray.push({ date: newDate, amount: input });

        this.oneTimeModifiedAmortized = createAmortized(this.principal, this.apr, this.startDate, this.payment, newExtraPaymentsArray, 0);

        this.oneTime_ppmtTrace.x = _.map(this.oneTimeModifiedAmortized, row => row.date);
        this.oneTime_ppmtTrace.y = _.map(this.oneTimeModifiedAmortized, row => row.ppmt);

        this.oneTime_ipmtTrace.x = _.map(this.oneTimeModifiedAmortized, row => row.date);
        this.oneTime_ipmtTrace.y = _.map(this.oneTimeModifiedAmortized, row => row.ipmt);

        this.oneTime_principalTrace.x = _.map(this.oneTimeModifiedAmortized, row => row.date);
        this.oneTime_principalTrace.y = _.map(this.oneTimeModifiedAmortized, row => row.principal);

        this.updateGraphs();
    }
}
</script>

<style lang="scss" scoped>
    .label {
        font-weight: bold;
        display: block;
    }
    .value {
        display: inline-block;
    }
    .row {
        display: flex;
    }
    .col {
        flex: 1;
    }
</style>
