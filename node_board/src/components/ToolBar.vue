<template>
  <div>
    <router-link to="/list">글 목록</router-link>|
    <router-link to="/write">글 쓰기</router-link>|
    <router-link to="/stream">동영상</router-link>|
    <router-link to="/stream2">동영상2</router-link>|
    <router-link to="/stream3">동영상3</router-link>|
    <router-link to="/stream4">동영상4</router-link>|<br>
    <router-link to="/excel">엑셀</router-link>|
    <router-link to="/upload"><span style="text-decoration:line-through">업로드</span></router-link>|
    <router-link to="/chunkupload">청크업로드</router-link>|
    <router-link to="/diskChunk">디스크청크</router-link>|
    <router-link to="/videoWrite">영상글업로드</router-link>|
    <router-link to="/progressUpload">진행바업로드</router-link>|
    <router-link to="/nestedComment">대댓글</router-link>|
    <select v-model="selectOption">
      <option value="title">제목</option>
      <option value="writer">작성자</option>
      <option value="content">내용</option>
    </select>
    <input type="text" @keyup.enter="search" v-model="searchValue" />
    <button @click="search">검색!</button>
    현재 유저 : 
    <select  @change="changeUser" ref="selectUser">
      <option value="testUser">testUser</option>
      <option value="testUser2">testUser2</option>
      <option value="testUser3">testUser3</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectOption: "title",
      searchValue: "",
    };
  },
  methods: {
    changeUser(){
      console.log('changeUser',this.$refs.selectUser.value);
      this.$store.commit('changeUser',this.$refs.selectUser.value);
    },
    search() {
      this.$store.dispatch("search", {
        searchValue: this.searchValue,
        selectOption: this.selectOption,
        routerName: this.$route.name,
      });
    },
  },
};
</script>

<style>
</style>