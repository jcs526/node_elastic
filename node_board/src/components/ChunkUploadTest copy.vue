<template>
  <div>
    Add a video here:
    <br />
    <form @submit.prevent="upload">
      <input type="file" required="true" @change="fileChange" />
      <button type="submit">제출</button>
      <p>{{ numberOfChunks }}</p>
      <p>Chunk # {{chunkCounter}} is {{percentComplete}}% uploaded . Total upload: {{totalPercentComplete}}%</p>
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      file: "",
      numberOfChunks: 0,
      chunkCounter: 0,
      chunkSize: 0,
      chunkStart: 0,
      chunkEnd: 0,
      videoId: "",
      playerUrl: "",
      chunkForm: new FormData(),
      percentComplete: 0,
      totalPercentComplete: 0,
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

    createChunk(start, end) {
      console.log("end", end);
      this.chunkCounter++;
      console.log("create chunk: ", this.chunkCounter);
      let chunkEnd = Math.min(start + this.chunkSize, this.file.size);
      const chunk = this.file.slice(start, chunkEnd);

      console.log(chunk);

      console.log(
        "i created a chunk of video" + start + "-" + chunkEnd + "minus 1	"
      );

      if (this.videoId.length > 0) {
        this.chunkForm.append("videoId", this.videoId);
        console.log("added chunk(video ID)");
      }
      this.chunkForm.append("file", chunk, this.file.name);
      console.log("added chunk");

      this.updateChunk(this.chunkForm, start);
    },

    updateChunk(chunkForm, start) {
      let oReq = new XMLHttpRequest();
      oReq.upload.addEventListener("progress", this.updateProgress);
      oReq.open("POST", "http://127.0.0.1:19901/upload1", true);
      let blobEnd = this.chunkEnd - 1;
      let contentRange =
        "bytes " + start + "-" + blobEnd + "/" + this.file.size;
      oReq.setRequestHeader("Content-Range", contentRange);
      console.log("Content-Range", contentRange);
    },

    updateProgress(event) {
      if (event.lengthComputable) {
        this.perventComplete = Math.round((event.loded / event.total) * 100);

        this.totalPercentComplete = Math.round(
          ((this.chunkCounter - 1) / this.numberOfChunks) * 100
        );
      }
    },
    upload() {
      this.chunkSize = 2000000;
      this.numberOfChunks = Math.ceil(this.file.size / this.chunkSize);

      for (let i = 1; i <= this.numberOfChunks; i++) {
        let start = this.chunkStart;
        let end = start + this.chunkSize;
        this.createChunk(start, end);
        this.chunkStart += this.chunkSize;
        this.chunkEnd += this.chunkSize;
      }
      return;

      const formData = new FormData();
      formData.append("file", this.file);

      let options = {
        method: "post",
        url: "http://127.0.0.1:19901/upload1",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let startTime = new Date();

      axios(options).then((res) => {
        console.log(res);
        let endTime = new Date();
        console.log("소요시간", (endTime - startTime) / 1000);
      });
    },
  },
};
</script>

<style>
</style>