<template>
  <div id="app">
    <tool-bar></tool-bar>
    <router-view></router-view>
    <spinner-view :loading="loadingStatus"></spinner-view>
  </div>
</template>

<script>
import ToolBar from "./components/ToolBar.vue";
import SpinnerView from "./utils/SpinnerView.vue";
import bus from './utils/bus.js'

export default {
  data() {
    return {
      loadingStatus: false,
    };
  },
  components: { ToolBar, SpinnerView },
  
  methods: {
     startSpinner(){
      this.loadingStatus = true;
    },
    endSpinner(){
      this.loadingStatus = false;
    }
  },
  created() {
    bus.$on('start:spinner',this.startSpinner);
    bus.$on('end:spinner',this.endSpinner);
  },
  beforeDestroy() {
     bus.$off('start:spinner',this.startSpinner);
    bus.$off('end:spinner',this.endSpinner);
  },
};
</script>

<style>
</style>
