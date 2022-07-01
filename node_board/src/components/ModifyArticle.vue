<template>
  <div>
    제목 : <input type="text" v-model="article.title" /><br />
    작성자 : <input type="text" v-model="article.writer" /><br />
    내용 : <textarea rows="10" cols="50" :value="article.content" /><br />
    <button @click="modify(article)">수정</button>
    <!-- <button @click="write">취소</button> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters({ article: "getArticle" }),
  },
  methods: {
    

    modify(article) {
      let textAreaValue = document.querySelector("textarea").value
      this.$store.dispatch('modifyBoard',{article:article,textAreaValue:textAreaValue})
        
    },
  },
};
</script>

<style>
</style>