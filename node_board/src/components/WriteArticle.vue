<template>
  <form>
    제목 : <input type="text" v-model="title" /><br />
    내용 : <textarea rows="10" cols="50" v-model="content" /><br />
    <button @click.prevent="write">제출</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      title: "",
      content: "",
    };
  },
  computed: {
    writer() {
      return this.$store.state.userId;
    },
  },
  methods: {
    write() {
      let formData = {
        title: this.title,
        writer: this.writer,
        content: this.content,
        date: new Date(),
      };
      console.log("formData", formData);
      let data = JSON.stringify(formData);
      console.log("data", data);
      this.$store.dispatch("writeArticle", { data: data });
    },
  },
};
</script>

<style>
</style>