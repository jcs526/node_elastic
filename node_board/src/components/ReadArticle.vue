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
    <router-link to="/modify">
    <button>수정</button>
    </router-link>
    <button @click.prevent="deleteBoard(article.id)">삭제</button>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["article"]),
  },
  methods: {
   deleteBoard(id){
    this.$store.dispatch('delete',id)
   }
  }  
};
</script>

<style>
</style>