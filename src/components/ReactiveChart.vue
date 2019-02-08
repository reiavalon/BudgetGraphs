<template>
    <div :ref="chart.uuid"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import { chartType } from '@/functions/types';
import Plotly from 'plotly.js';

@Component
export default class ReactiveChart extends Vue {
  @Prop() private chart!: chartType;
  
  mounted() {
      Plotly.react(
          <HTMLElement>this.$refs[this.chart.uuid],
          this.chart.traces,
          this.chart.layout
      );
  }

  @Watch('chart', { immediate: false, deep: true })
  onChartValueChanged(val: chartType, oldVal: chartType) {
      Plotly.react(
          <HTMLElement>this.$refs[this.chart.uuid],
          this.chart.traces,
          this.chart.layout
      );
  }
}
</script>

<style lang="sass" scoped>

</style>
