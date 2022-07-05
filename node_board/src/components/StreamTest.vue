<template>
  <div>
    <video
      id="videoPlayer"
      width="650"
      controls
      muted="muted"
      autoplay
      @play="startPlay"
      @pause="pausePlay"
    >
      <!-- <source src="http://127.0.0.1:19901/video#t=20" type="video/mp4" /></video 동영상 20초부터 시작-->
      <source src="http://127.0.0.1:19901/video" type="video/mp4" /></video
    ><br />
    <p>{{ percent || 0 }}%</p>
    <div v-if="complete">수료완료!</div>
    <select v-model="speed" @change="controlSpeed(speed)">
      <option>1.0</option>
      <option>1.2</option>
      <option>1.4</option>
      <option>1.6</option>
      <option>1.8</option>
      <option>2.0</option>
    </select>
    <button @click="thumbnail">썸네일 생성!!!</button>
  </div>
</template>

<script>
import axios from "axios";

let checkComplete;
export default {
  data() {
    return {
      speed: "1.0",
      percent: 0,
      complete: false,
      check: new Set(),
      currentTime: "",
      duration: "",
    };
  },

  methods: {
    controlSpeed(speed) {
      if (!this.complete) {
        this.timeCheck();
      }
      let $video = document.querySelector("video");
      $video.playbackRate = speed;
      let formData = {
        currentTime: this.currentTime,
        complete: this.complete,
        check: Array.from(this.check).sort((a,b)=>a-b),
      };
      let data = JSON.stringify(formData);
      console.log(data);
      console.log("check",this.check);
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      console.log(data);
      axios.post("http://127.0.0.1:19901/stream", data, options);
    },
    // update() {
    //   if (!this.complete) {
    //     this.timeCheck();
    //   }
    // },
    timeCheck() {
      if (!this.complete) {
        let $video = document.querySelector("video");
        this.currentTime = $video.currentTime;
        this.duration = $video.duration;
        if (!isNaN(this.currentTime))
          this.check.add(Math.floor(this.currentTime));
        console.log(this.check);
        // document.querySelector('p').innerHTML = Math.floor(this.check.size/duration*100)+"%";
        this.percent = Math.round((this.check.size / this.duration) * 100);

        if (this.check.size >= this.duration * 0.95) {
          this.complete = true;
          clearInterval(checkComplete);
        }
      }
    },
    startPlay() {
      if (!this.complete) {
        this.timeCheck();
        checkComplete = setInterval(() => this.timeCheck(), 250);
      }
      console.log("Start");
    },
    pausePlay() {
      if (!this.complete) {
        clearInterval(checkComplete);
        this.timeCheck();
      }
      console.log("pause");
    },
    thumbnail() {
      console.log("엑시오스 됨?");
      axios({
        method: "POST",
        url: "http://127.0.0.1:19901/thumbnail",
        responseType: "blob",
      })
        .then((res) => {
          // console.log(res);
          // const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] } ));
          // img.src=url;
          // console.log("res.data : ",res.data);
          // console.log("url : ", url);

          setTimeout(() => {
            console.log(res);
            for (let i = 1; i <= 10; i++) {
              let img = document.createElement("img");
              img.src = `http://localhost:19901/thumbnail/tn_${i}.png`;
              img.addEventListener("click", () => {
                axios
                  .get(`http://127.0.0.1:19901/thumbnail/${i}`)
                  .then(console.log("선택완료"));
              });
              document.querySelector("div").appendChild(img);
              console.log(i);
            }
          }, 5000);
        })
        .catch((e) => {
          console.log(`error === ${e}`);
        });
    },
  },

  mounted() {
    window.addEventListener("beforeunload", () => {});
    axios.get("http:127.0.0.1:19901/stream")
    .then((res)=>{
      console.log(res);
    })
  },
};
</script>

<style>
</style>