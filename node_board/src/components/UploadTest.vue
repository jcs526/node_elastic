<template>
  <div>
    업로드
    <form @submit.prevent="upload">
      <label for="file">file: </label>
      <input type="file" required="true" @change="fileChange" />
      <input type="submit" />
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      file: "",
    };
  },
  methods: {
    fileChange(e) {
      console.log(e.target.files[0]);
      const file = e.target.files[0];
      this.file = file;
    },
    upload() {
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
      let start = new Date();

      axios(options).then((res) => {
        console.log(res);
        let end = new Date();
         console.log("소요시간", (end - start) / 1000);
      });

     
    },
  },
};
</script>

<style>
</style>