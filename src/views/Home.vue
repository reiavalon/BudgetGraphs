<template>
  <div class="home">
    <BudgetGraphs 
      principal="188000.00"
      apr="0.0375"
      :startDate="houseStartDate"
      payment="870.66"
      uuid="1"
    />
    <BudgetGraphs 
      principal="35477.99"
      apr="0.0239"
      :startDate="carStartDate"
      payment="529.41"
      uuid="2"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BudgetGraphs from '@/views/BudgetGraphs.vue';

@Component({
  components: {
    BudgetGraphs
  },
})
export default class Home extends Vue {
  private onPeriodicChanged(input: number) {
    console.log(`onPeriodChanged: ${input}`);
  }

  private onOneTimeChanged(input: number) {
    console.log(`onOneTimeChanged: ${input}`);
  }

  private houseStartDate: Date = new Date(2017, 10-1, 27);
  private carStartDate: Date = new Date(2016, 4-1, 22);
}
</script>
