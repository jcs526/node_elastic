<template>
  <form>
    제목 : <input type="text" v-model="title" /><br />
    작성자 : <input type="text" v-model="writer" /><br />
    내용 : <textarea rows="10" cols="50" v-model="content" /><br />
    <button @click.prevent="write">제출</button>
  </form>
</template>

<script>

export default {
  data() {
    return {
      title: "",
      writer: "",
      content: "",
    };
  },
  methods: {
    write() {
      let formData = {
        title: this.title,
        writer: this.writer,
        content: this.content,
        date : new Date(),
      };
      let data = JSON.stringify(formData);
      this.$store.dispatch('writeArticle',{data:data});
    },
  },
};
</script>

<style>
</style>