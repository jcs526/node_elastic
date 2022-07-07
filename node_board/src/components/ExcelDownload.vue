<template>
  <div>
    엑셀 테스트<br />
    <button @click="download">다운</button>
    <a href="http://127.0.0.1:19901/excel">얍</a>
    <button id="exportFile">Export To File</button>
  </div>
</template>

<script>
const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

import axios from "axios";

export default {
  methods: {
    download() {
      window.open("http://127.0.0.1:19901/excel/123");
    },
  },
  mounted() {
    let options = {
      url: "http://127.0.0.1:19901/excel/123",
      method: "GET",
      responseType: "blob",
    };
    axios(options).then(async (res) => {
      console.log(res);
      console.log(res.data.length);
      const buffer = res.data;
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      link.href = URL.createObjectURL(blob);
      link.download = "testtttttt.xlsx";
      link.click();
      //   console.log("Are we getting here?", res);
      //   const excelBlog = await excel.blob();
      //   const excelURL = URL.createObjectURL(excelBlog);

      //   const anchor = document.createElement('a');
      //   anchor.href=excelURL;
      //   anchor.download="test.xlsx";

      //   document.body.appendChild(anchor);
      //   anchor.click();
      //   document.body.removeChild(anchor);

      //   URL.revokeObjectURL(excelURL);
    });
  },
};
</script>

<style>
</style>