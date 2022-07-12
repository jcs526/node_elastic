<template>
  <div>
    Add a video here:
    <br />
    <form @submit.prevent="upload">
      <input type="file" required="true" @change="fileChange" />
      <button type="submit">제출</button>
      <p>chunk size : {{ (chunkSize / 1000000) * 0.95 }}MB</p>
      <p>Total chunk : {{ numberOfChunks }}</p>
      <p>ing... : {{ chunkCounter }}</p>
      <p>complete : {{ complete }}</p>
      <p>complete% : {{ totalPercentComplete }}%</p>
      <progress :value="totalPercentComplete" max="100"></progress>
      <div v-if="startTime && endTime">
        업로드 시간 : {{ (endTime - startTime) / 1000 }}초
      </div>

      <div v-if="endTime && completeTime">
        업로드부터 생성까지 걸린 시간 : {{ (completeTime - endTime) / 1000 }}초
        <br>
        총 걸린 시간 : {{ (completeTime - startTime) / 1000 }}초
      </div>
    </form>
    <br />
    <br />
    <p>---------------------------DiskStrorage Chunk----------------------------</p>
    <!-- <video  width="500" height="auto" src="http://127.0.0.1:19901/video/1f2e9337-76ed-40da-a94a-4da1a16932c3" controls></video> -->
    <br />
  </div>
</template>

<script>
import axios from "axios";
import { v4 } from "uuid";
import bus from '../utils/bus'
// import axios from "axios";
export default {
  data() {
    return {
      file: "",
      numberOfChunks: 0,
      chunkCounter: 0,
      chunkSize: 2 ** 22,
      chunkStart: 0,
      chunkEnd: 0,
      chunkForm: new FormData(),
      complete: 0,
      totalPercentComplete: 0,
      start: 0,
      end: 0,
      startTime: "",
      endTime: "",
      uuid: v4(),
      completeTime: "",
    };
  },
  methods: {
    fileChange(e) {
      console.log(e.target.files[0]);
      const file = e.target.files[0];
      this.file = file;
      this.chunkEnd = 0;
      this.chunkStart = 0;
      this.numberOfChunks = 0;
      this.chunkCounter = 0;
    },
    fileSlice(file, start, end) {
      let slice = file.mozSlice
        ? file.mozSlice
        : file.webkitSlice
        ? file.webkitSlice
        : file.slice
        ? file.slice
        : this.noop;

      return slice.bind(file)(start, end);
    },
    noop() {},
    sendChunk(piece, start, end) {
      // console.log(this.file);
      let formData = new FormData();
      let xhr = new XMLHttpRequest();

      xhr.open("POST", "http://127.0.0.1:19901/upload3", true);

      formData.append("start", start);
      formData.append("end", end);
      formData.append("numberOfChunks", this.numberOfChunks);
      formData.append("chunkCounter", this.chunkCounter);
      formData.append("totalSize", this.file.size);
      formData.append("fileName", this.file.name);
      formData.append("uuid", this.uuid);
      formData.append("file", piece);

      // console.log(Array.from(formData.keys()));
      // console.log(Array.from(formData.values()));
      xhr.onload = () => {
        console.log(xhr.responseText);
        this.complete++;
        if (this.complete === this.numberOfChunks) {
          this.endTime = new Date();
        }
        this.totalPercentComplete = Math.ceil(
          (this.complete / this.numberOfChunks) * 100
        );

        if (this.complete === this.numberOfChunks) {
          bus.$emit('start:spinner')
          this.merge();
          this.chunkEnd = 0;
          this.chunkStart = 0;
          this.numberOfChunks = 0;
          this.chunkCounter = 0;
        }
      };

      xhr.send(formData);
    },

    loop() {
      this.chunkCounter++;
      this.end = this.start + this.chunkSize;

      if (this.file.size - this.end < 0) {
        this.end = this.file.size;
      }
      // console.log("start", this.start, "end", this.end);
      let s = this.fileSlice(this.file, this.start, this.end);

      this.sendChunk(s, this.start, this.end);
      if (this.end < this.file.size) {
        this.start += this.chunkSize;
        setTimeout(this.loop, 1);
      }
    },

    upload() {

      this.numberOfChunks = Math.ceil(this.file.size / this.chunkSize);
      this.startTime = new Date();

      setTimeout(this.loop, 1);
    },

    merge() {
      let formData = new FormData();

      formData.append("dd", "Dd");

      formData.append("numberOfChunks", this.numberOfChunks);
      formData.append("totalSize", this.file.size);
      formData.append("fileName", this.file.name);
      formData.append("uuid", this.uuid);

      console.log(formData);

      let options = {
        method: "post",
        url: "http://127.0.0.1:19901/merge",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      axios(options).then((res) => {
        console.log(res.data);
        this.completeTime = new Date();
        setTimeout(()=>{

        let video = document.createElement("video");
          video.src = `http://127.0.0.1:19901/video/${this.uuid}`;
          video.autoplay = true;
          video.muted = true;
          video.controls = true;
          video.setAttribute('width',500)
          
          document.body.appendChild(video);
          bus.$emit('end:spinner')
        },10000)
      });
    },
  },
};
</script>

<style>
</style>