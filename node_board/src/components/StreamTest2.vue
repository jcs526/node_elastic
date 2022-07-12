<template>
  <div>
    <video
      width="650"
      controls
      muted="muted"
      startTime="20"
      @play="startPlay"
      @pause="pausePlay"
    >
      <!-- <source src="http://127.0.0.1:19901/video#t=20" type="video/mp4" /></video 동영상 20초부터 시작-->
      <source src="http://127.0.0.1:19901/video/sample" type="video/mp4" /></video
    ><br />
    <progress max="95" :value="percent"></progress>
    <p>{{ percent || 0 }}%</p>
    <div v-if="complete">수료완료!</div>
    <select v-model="speed" @change="controlSpeed(speed)">
      <option>1.0</option>
      <option>1.2</option>
      <option>1.4</option>
      <option>1.6</option>
      <option>1.8</option>
      <option>2.0</option>
      <option>3.0</option>
      <option>4.0</option></select
    ><br />
    <button @click="submitData">제출</button>
    <button @click="deleteData">삭제</button><br /><br />
    <button @click="thumbnail">썸네일 생성!</button>
    기존+뒤로가기 막기+제출&삭제추가
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
      currentTime: 0,
      duration: 0,
      maxTime: 5,
    };
  },

  methods: {
    deleteData() {
      let formData = {
        id: "123",
      };
      let data = JSON.stringify(formData);
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      axios.delete("http://127.0.0.1:19901/stream", data, options);
    },

    submitData() {
      let currentTime = document.querySelector("video").currentTime;
      if (currentTime > this.maxTime) {
        currentTime = this.maxTime;
      }
      let formData = {
        maxTime: this.maxTime,
        complete: this.complete,
        currentTime: currentTime,
      };
      let data = JSON.stringify(formData);
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      axios
        .put("http://127.0.0.1:19901/stream", data, options)
        .then(() => console.log("갱신완료"));
    },
    controlSpeed(speed) {
      if (!this.complete) {
        this.timeCheck();
      }
      let $video = document.querySelector("video");
      $video.playbackRate = speed;
    },
    timeCheck() {
      if (!this.complete) {
        let $video = document.querySelector("video");
        this.currentTime = $video.currentTime;
        this.duration = $video.duration;
        if ($video.currentTime > this.maxTime + 0.5 * this.speed) {
          $video.currentTime = this.maxTime;
        } else {
          this.maxTime =
            this.maxTime >= $video.currentTime
              ? this.maxTime
              : this.currentTime;
        }
        if (this.maxTime >= 0.95 * this.duration) {
          this.complete = true;
        }
        this.percent = Math.round((this.maxTime / this.duration) * 100);
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
    axios.get("http://127.0.0.1:19901/stream2").then((res) => {
      this.currentTime = res.data.currentTime;
      this.maxTime = res.data.maxTime;
      this.complete = res.data.complete;
      document.querySelector("video").currentTime = this.currentTime;
      if(this.complete){
        this.percent=95;
      }
    });
  },
};
</script>

<style>
</style>