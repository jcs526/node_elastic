<template>
  <div>
    <video-player
      class="video-player vjs-custom-skin"
      ref="videoPlayer"
      :playsinline="true"
      :options="playerOptions"
      @pause="pausePlay($event)"
      @play="startPlay($event)"
    ></video-player>
    <progress max="95" :value="percent"></progress>

    <p v-if="!complete">{{ percent || 0 }}%</p>
    <div v-else-if="complete">수료완료!</div>
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
    <button @click="thumbnail">썸네일 생성</button>
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
      maxTime: 0,
      name: "thumb",
      playerOptions: {
        // playbackRates: [0.5, 1.0, 1.5, 2.0], //
        autoplay: false, //  true,           。
        muted: false, //              。
        loop: false, //           。
        preload: "auto", //       <video>                 。auto         ,        （       ）
        language: "zh-CN",
        aspectRatio: "16:9", //           ，                 。          -           （  "16:9" "4:3"）
        fluid: true, //  true ，Video.js player       。    ，             。
        sources: [
          {
            type: "video/mp4",
            src: "http://127.0.0.1:19901/video", //url
          },
        ],
        poster: "", //
        // width: document.documentElement.clientWidth,
        notSupportedMessage: "        ，     ", //    Video.js               。
        controlBar: {
          timeDivider: true, //
          durationDisplay: true, //
          remainingTimeDisplay: false, //
          fullscreenToggle: true, //
        },
      },
    };
  },
  computed: {
    player() {
      return this.$refs.videoPlayer.player;
    },
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
        // Object.defineProperty($video,'playbackRate',{
        //   set(speed){
        //     this.playbackRate=speed;
        //   }
        // })
        this.currentTime = $video.currentTime;
        this.duration = $video.duration;
        console.log($video.currentTime);
        console.log(this.maxTime);
        console.log("속도", $video.playbackRate);
        if ($video.currentTime > this.maxTime + 0.5) {
          $video.pause();
          alert("비정상적인 움직임이 감지되었습니다.(시간)");
          $video.currentTime = this.maxTime;
          $video.play();
        } else if ($video.playbackRate > 1) {
          $video.pause();
          alert("비정상적인 움직임이 감지되었습니다.(속도)");
          $video.currentTime = this.maxTime;
          $video.playbackRate=1
          $video.play();
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
      console.log(this.$refs.videoPlayer.player.children()[0]);
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
      this.currentTime = document.querySelector("video").currentTime;
      let data = { timestamp: this.currentTime, name: this.name };
      let option = {
        method: "POST",
        url: "http://127.0.0.1:19901/thumbnail2",
        responseType: "blob",
        data: data,
      };
      axios(option)
        .then((res) => {
          // console.log(res);
          // const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] } ));
          // img.src=url;
          // console.log("res.data : ",res.data);
          // console.log("url : ", url);

          setTimeout(() => {
            console.log(res);
            let img = document.createElement("img");
            img.src = `http://localhost:19901/video/output/${data.name}-at-${data.timestamp}-seconds.png`;
            document.querySelector("div").appendChild(img);
          }, 0);
        })
        .catch((e) => {
          console.log(`error === ${e}`);
        });
    },
  },

  mounted() {
    axios.get("http://127.0.0.1:19901/stream2").then((res) => {
      this.currentTime = res.data.currentTime;
      this.maxTime = res.data.maxTime;
      this.complete = res.data.complete;
      let $video = document.querySelector("video");
      $video.currentTime = this.currentTime;
    });

    document.addEventListener("DOMContentLoaded", function () {
      var originalDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype,
        "playbackRate"
      );

      Object.defineProperty(HTMLVideoElement.prototype, "playbackRate", {
        set: function (value) {
          if (value > 1) {
            console.log(1 + "보다 커서 적용안함");
            return;
          }
          originalDescriptor.set.call(this, 1);
        },
        get: originalDescriptor.get,
      });
    });
  },
};
</script>

<style>
</style>