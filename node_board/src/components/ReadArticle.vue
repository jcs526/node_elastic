<template>
  <div>
    제목 : {{ article.title }}
    <br />
    <br />
    <br />
    내용: {{ article.content }} <br />
    작성자 : {{ article.writer }}<br />
    작성시간 : {{ article.date }}<br />
    <br />
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
    <router-link to="/modify">
      <button>수정</button>
    </router-link>
    <button @click.prevent="deleteBoard(article.id)">삭제</button>
    <button @click="submitData">제출</button>
    <button @click="deleteData">삭제</button>
  </div>
</template>

<script>
import axios from "axios";

let checkComplete;

export default {
  data() {
    return {
      article: {},
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
            src: `http://127.0.0.1:19901/video/sample`, //url
          },
        ],
        poster: "", //
        // width: document.documentElement.clientWidth,
        notSupportedMessage: "            ", //    Video.js               。
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
    deleteBoard(id) {
      this.$store.dispatch("delete", id);
    },
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
        userId: this.$store.state.userId,
        videoId: this.article.id,
      };
      let data = JSON.stringify(formData);
      let options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      axios
        .put("http://127.0.0.1:19901/userUpdate", data, options)
        .then(() => console.log("갱신완료"));
    },
    timeCheck() {
      console.log(this.article.id);
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
          $video.playbackRate = 1;
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
  },
  mounted() {
    axios
      .post("http://127.0.0.1:19901/select", { id: this.$route.params.id })
      .then((res) => {
        this.article = res.data[0];
        return res.data[0];
      })
      .then((response) => {
        axios
          .get(
            `http://127.0.0.1:19901/userInfo?userId=${this.$store.state.userId}&videoId=${this.article.id}`
          )
          .then((res) => {
            console.log(res);
            this.currentTime = res.data.currentTime;
            this.maxTime = res.data.maxTime;
            this.complete = res.data.complete;
            let $video = document.querySelector("video");
            $video.currentTime = this.currentTime;
            console.log(response);
            $video.src = `http://127.0.0.1:19901/video/${response.id}`;
          });
      });
  },
  beforeDestroy() {
    clearInterval(checkComplete);
  },
};
</script>

<style>
</style>