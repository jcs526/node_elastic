<template>
  <div>
    <video id="videoPlayer" width="650" controls muted="muted" autoplay currentTime="20">
      <!-- <source src="http://127.0.0.1:19903/video#t=20" type="video/mp4" /></video 동영상 20초부터 시작-->
      <source src="http://127.0.0.1:19903/video#t=20" type="video/mp4" /></video
    ><br />
    <p>{{ percent || 0 }}%</p>
    <div v-if="complete">수료완료!</div>
    <button @click="thumbnail">썸네일 생성!!!</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      percent: 0,
      complete: false,
    };
  },

  methods: {
    thumbnail() {
      console.log("엑시오스 됨?");
      axios({
        method: "POST",
        url: "http://127.0.0.1:19903",
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
              img.src = `http://localhost:19903/tn_${i}.png`;
              img.addEventListener("click", () => {
                axios.get(`http://127.0.0.1:19903/thumbnail/${i}`).then(console.log("선택완료"));
              });
              document.querySelector("div").appendChild(img);
              console.log(i);
            }
          }, 5000);
        })
        .catch((e) => {
          console.log(`error === ${e}`);
        });
    }
  },
  mounted() {
    

    let $video = document.querySelector("video");
    // let {duration} = $video
    let check = new Set();

    let checkComplete = setInterval(() => timeCheck(), 1000);
    let thisComponent = this;
    function timeCheck() {
      let { currentTime, duration } = $video;
      if (!isNaN(currentTime)) check.add(Math.floor(currentTime));
      console.log(check);
      // document.querySelector('p').innerHTML = Math.floor(check.size/duration*100)+"%";
      thisComponent.percent = Math.floor((check.size / duration) * 100);

      if (check.size >= duration * 0.95) {
        thisComponent.complete = true;
        clearInterval(checkComplete);
      }
    }
    // 시청기록 , 시청기록을 %로, 시청기록부터 보는 기능, 수료표시
  },
};
</script>

<style>
</style>