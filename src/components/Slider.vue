<template>
  <div>
      <h1>{{title}}</h1>
      <input type="range" min="0" :max="maxValue" v-model="currentValue" @input="_onValueChanged"/>
      <div>Max Value: <input type="number" v-model="maxValue"/></div>
      <div>{{currentValue}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

@Component
export default class Slider extends Vue {
  @Prop({default: ''}) private title!: string;
  @Prop({default: 0}) initialValue!: number;
  private maxValue: string = '1000';
  private currentValue: string = String(this.initialValue);

  private _onValueChanged() {
      this.onValueChanged(Number(this.currentValue));
  }

  @Emit('value-changed')
  private onValueChanged(input: number) {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
