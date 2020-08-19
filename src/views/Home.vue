<template>
  <div class="home">
    <BudgetGraphCondensed
      principal="182500.00"
      apr="0.03000"
      :startDate="houseStartDate"
      payment="1260.31"
      uuid="2"
    />
    <!--
    <BudgetGraphs 
      principal="182500.00"
      apr="0.03000"
      :startDate="houseStartDate"
      payment="1260.31"
      uuid="1"
    />
    -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BudgetGraphCondensed from '@/views/BudgetGraphCondensed.vue';
import BudgetGraphs from '@/views/BudgetGraphs.vue';

@Component({
  components: {
    BudgetGraphs,
    BudgetGraphCondensed
  },
})
export default class Home extends Vue {
  private onPeriodicChanged(input: number) {
    console.log(`onPeriodChanged: ${input}`);
  }

  private onOneTimeChanged(input: number) {
    console.log(`onOneTimeChanged: ${input}`);
  }

  private houseStartDate: Date = new Date(2020, 5-1, 1);
}
</script>
