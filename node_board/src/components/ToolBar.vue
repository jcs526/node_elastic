<template>
  <div>
    <router-link to="/list">글 목록</router-link>|
    <router-link to="/write">글 쓰기</router-link>|
    <router-link to="/stream">동영상</router-link>|
    <select v-model="selectOption">
      <option value="title">제목</option>
      <option value="writer">작성자</option>
      <option value="content">내용</option>
    </select>
    <input type="text" @keyup.enter="search" v-model="searchValue">
    <button @click="search" >검색!</button>
  </div>
</template>

<script>
export default {
    data() {
        return {
          selectOption:"title",
            searchValue:""
        }
    },
    methods: {
        search(){
          this.$store.dispatch('search',{searchValue:this.searchValue,selectOption:this.selectOption,routerName:this.$route.name})
        }
    },
};
</script>

<style>
</style>