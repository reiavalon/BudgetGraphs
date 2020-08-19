<template>
    <div>
        <div><b>${{principal}}</b> borrowed at <b>{{apr * 100}}%</b> starting on <b>{{startDate.toDateString()}}</b> with base payment <b>${{payment}}</b></div>

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
            <div class="col">0.00</div>
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

        <div class="row">
            <div class="col" :ref="'paymentsGraph' + uuid" id="paymentsGraph" />
            <div class="col" :ref="'principalGraph' + uuid" id="principalGraph" />
        </div>
        <div class="row">
            <div class="col" :ref="'interestPeriodicGraph' + uuid" id="interestGraph" />
            <div class="col" :ref="'payoffPeriodicGraph' + uuid" id="payoffGraph" />
        </div>
        <div class="row">
            <div class="col" :ref="'interestOneTimeGraph' + uuid" id="interestGraph" />
            <div class="col" :ref="'payoffDateOneTimeGraph' + uuid" id="payoffGraph" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Slider from '@/components/Slider.vue';
import { extraPaymentElem, amortizedElem, chartType } from '@/functions/types';
import { advanceDateByMonth } from '@/functions/extraPaymentFunctions';
import { AmortizedSchedule } from '@/functions/AmortizedSchedule';
import Plotly,{ PlotData } from 'plotly.js';
import * as _ from 'lodash';

@Component({
  components: {
    Slider
  },
})
export default class BudgetGraphsCondensed extends Vue {
    @Prop() principal!: number;
    @Prop() apr!: number;
    @Prop() startDate!: Date;
    @Prop() payment!: number;
    @Prop() uuid!: number;

    private baseAmortized: AmortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);
    private modifiedAmortized: AmortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);
    private periodicModifiedAmortized: AmortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);
    private oneTimeModifiedAmortized: AmortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);

    private extraPaymentArray: extraPaymentElem[] = [];

    private currentPeriodic: number = 0;
    private currentOneTime: number = 0;

    private interestPeriodicGraph: Partial<PlotData> = {
        type: "scatter",
        name: "Interest Periodic Graph",
        x: [],
        y: []
    }

    private payoffDatePeriodicGraph: Partial<PlotData> = {
        type: "scatter",
        name: "Payoff Periodic Graph",
        x: [],
        y: []
    }

    private interestOneTimeGraph: Partial<PlotData> = {
        type: "scatter",
        name: "Interest Periodic Graph",
        x: [],
        y: []
    }

    private payoffDateOneTimeGraph: Partial<PlotData> = {
        type: "scatter",
        name: "Payoff Periodic Graph",
        x: [],
        y: []
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

    get baseInterest(): string { return this.baseAmortized.totalInterest.toFixed(2); }
    get currentInterest(): string { return this.modifiedAmortized.totalInterest.toFixed(2); }
    get periodicInterest(): string { return this.periodicModifiedAmortized.totalInterest.toFixed(2); }
    get oneTimeInterest(): string { return this.oneTimeModifiedAmortized.totalInterest.toFixed(2); }

    get basePayoffDate(): string { return this.baseAmortized.payoffDate.toDateString(); }
    get currentPayoffDate(): string { return this.modifiedAmortized.payoffDate.toDateString(); }
    get periodicPayoffDate(): string { return this.periodicModifiedAmortized.payoffDate.toDateString(); }
    get oneTimePayoffDate(): string { return this.oneTimeModifiedAmortized.payoffDate.toDateString(); }

    private ppmtTrace(amortizedSchedule: AmortizedSchedule, name: string): Partial<PlotData> {
        return {
            type: "scatter",
            name: name,
            x: amortizedSchedule.dateArray,
            y: amortizedSchedule.ppmtArray
        }
    }

    private ipmtTrace(amortizedSchedule: AmortizedSchedule, name: string): Partial<PlotData> {
        return {
            type: "scatter",
            name: name,
            x: amortizedSchedule.dateArray,
            y: amortizedSchedule.ipmtArray
        }
    }

    private principalTrace(amortizedSchedule: AmortizedSchedule, name: string): Partial<PlotData> {
        return {
            type: "scatter",
            name: name,
            x: amortizedSchedule.dateArray,
            y: amortizedSchedule.principalArray
        }
    }

    get base_ppmtTrace(): Partial<PlotData> { return this.ppmtTrace(this.baseAmortized, "Base Principal Payment"); }
    get base_ipmtTrace(): Partial<PlotData> { return this.ipmtTrace(this.baseAmortized, "Base Interest Payment"); }
    get base_principalTrace(): Partial<PlotData> { return this.principalTrace(this.baseAmortized, "Base Principal"); }

    get modified_ppmtTrace(): Partial<PlotData> { return this.ppmtTrace(this.modifiedAmortized, "Modified Principal Payment"); }
    get modified_ipmtTrace(): Partial<PlotData> { return this.ipmtTrace(this.modifiedAmortized, "Modified Interest Payment"); }
    get modified_principalTrace(): Partial<PlotData> { return this.principalTrace(this.modifiedAmortized, "Modified Principal"); }

    get periodic_ppmtTrace(): Partial<PlotData> { return this.ppmtTrace(this.periodicModifiedAmortized, "Periodic Principal Payment"); }
    get periodic_ipmtTrace(): Partial<PlotData> { return this.ipmtTrace(this.periodicModifiedAmortized,"Periodic Interest Payment"); }
    get periodic_principalTrace(): Partial<PlotData> { return this.principalTrace(this.periodicModifiedAmortized, "Periodic Principal"); }

    get oneTime_ppmtTrace(): Partial<PlotData> { return this.ppmtTrace(this.oneTimeModifiedAmortized, "One Time Principal Payment"); }
    get oneTime_ipmtTrace(): Partial<PlotData> { return this.ipmtTrace(this.oneTimeModifiedAmortized,"One Time Interest Payment"); }
    get oneTime_principalTrace(): Partial<PlotData> { return this.principalTrace(this.oneTimeModifiedAmortized, "One Time Principal"); }

    get AmortizedTraceArray() {
        return [
            this.base_ppmtTrace, 
            this.base_ipmtTrace, 
            this.modified_ppmtTrace, 
            this.modified_ipmtTrace, 
            this.periodic_ppmtTrace, 
            this.periodic_ipmtTrace, 
            this.oneTime_ppmtTrace, 
            this.oneTime_ipmtTrace
        ]
    }

    get PrincipalTraceArray() {
        return [
            this.base_principalTrace, 
            this.modified_principalTrace, 
            this.periodic_principalTrace, 
            this.oneTime_principalTrace
        ]
    }

    mounted() {
        this.extraPaymentArray = []

        this.baseAmortized = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);
        this.modifiedAmortized = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, this.extraPaymentArray);
        this.periodicModifiedAmortized = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);
        this.oneTimeModifiedAmortized = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, []);

        let periodicArray: number[] = [];
        for(let i = 0; i <= 5000; i += 50) { periodicArray.push(i); }

        let oneTimeArray: number[] = [];
        for(let i = 0; i <= 150000; i += 500) { oneTimeArray.push(i); }

        this.interestPeriodicGraph.x = periodicArray;
        this.interestPeriodicGraph.y = _.map(periodicArray, periodic => {
            let amortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, this.extraPaymentArray);
            amortizedSchedule.setPeriodicPayment(periodic);
            return amortizedSchedule.totalInterest;
        });

        this.payoffDatePeriodicGraph.x = periodicArray;
        this.payoffDatePeriodicGraph.y = _.map(periodicArray, periodic => {
            let amortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, this.extraPaymentArray);
            amortizedSchedule.setPeriodicPayment(periodic);
            return amortizedSchedule.payoffDate;
        });

        this.interestOneTimeGraph.x = oneTimeArray;
        this.interestOneTimeGraph.y = _.map(oneTimeArray, oneTime => {
            let amortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, this.extraPaymentArray);
            amortizedSchedule.setOneTimeExtraPayment(oneTime);
            return amortizedSchedule.totalInterest;
        });

        this.payoffDateOneTimeGraph.x = oneTimeArray;
        this.payoffDateOneTimeGraph.y = _.map(oneTimeArray, oneTime => {
            let amortizedSchedule = new AmortizedSchedule(this.principal, this.apr, this.startDate, this.payment, this.extraPaymentArray);
            amortizedSchedule.setOneTimeExtraPayment(oneTime);
            return amortizedSchedule.payoffDate;
        });

        Plotly.react(<HTMLElement>this.$refs['interestPeriodicGraph' + this.uuid], [this.interestPeriodicGraph], { title: "Interest Periodic Graph", showlegend: false });
        Plotly.react(<HTMLElement>this.$refs['payoffPeriodicGraph' + this.uuid], [this.payoffDatePeriodicGraph], { title: "Payoff Periodic Graph", showlegend: false });

        Plotly.react(<HTMLElement>this.$refs['interestOneTimeGraph' + this.uuid], [this.interestOneTimeGraph], { title: "Interest One Time Graph", showlegend: false });
        Plotly.react(<HTMLElement>this.$refs['payoffDateOneTimeGraph' + this.uuid], [this.payoffDateOneTimeGraph], { title: "Payoff One Time Graph", showlegend: false });

        this.updateGraphs();
    }

    private updateGraphs() {
        Plotly.react(<HTMLElement>this.$refs['paymentsGraph' + this.uuid], 
            this.AmortizedTraceArray, 
            {
                title: 'Amortized Schedule', 
                showlegend: false
            });
        Plotly.react(<HTMLElement>this.$refs['principalGraph' + this.uuid],
            this.PrincipalTraceArray, 
            {
                title: 'Principal Schedule', 
                showlegend: false
            });
    }

    private onPeriodicChanged(input: number) {
        this.periodicModifiedAmortized.setPeriodicPayment(input);
        this.updateGraphs();
    }

    private onOneTimeChanged(input: number) {
        this.oneTimeModifiedAmortized.setOneTimeExtraPayment(input);
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
