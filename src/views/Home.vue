<template>
  <div class="home">
    <BudgetGraphs />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import Slider from '@/components/Slider.vue';
import BudgetGraphs from '@/views/BudgetGraphs.vue';

@Component({
  components: {
    HelloWorld,
    Slider,
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
}
</script>
