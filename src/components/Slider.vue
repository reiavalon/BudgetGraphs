<template>
  <div style="display:flex;">
      <div>{{title}}:</div>
      <div><input type="range" min="0" :max="maxValue" v-model="currentValue" @input="_onValueChanged"/></div>
      <div>{{currentValue}}</div>
      <div style="padding:0px 5px;">of</div>
      <div><input type="number" v-model="maxValue"/></div>
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
