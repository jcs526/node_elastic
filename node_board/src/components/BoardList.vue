<template>
  <div>
    <table>
      <tr>
        <th class="thtitle">제목</th>
        <th>작성자</th>
        <th>시간</th>
      </tr>
      <tr v-for="(item, index) in boardList" :key="index" class="post">
      <router-link :to="/article/+item.id" class="link-text">
        <td  @click="selectAritcle(item)" class="title">{{ item.title }}</td>
        </router-link>
        <td>{{ item.writer }}</td>
        <td>{{ item.date }}</td>
      </tr>
    </table>
    
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
       selectOption:"title",
            searchValue:""
    };
  },

  computed: {
    ...mapState(["boardList"]),
  },

  methods: {

    selectAritcle(item){
      this.$store.commit('SET_ARTICLE',item)
    },
  },



};
</script>

<style>
table {
  text-align: center;
  width: 100%;
  border: 1px solid #444444;
  border-collapse: collapse;
}
tr,
td,
th {
  border: 1px solid #444444;
  margin: 0;
  padding: 0;
}
.thtitle{
  width: 60%;
}
.title{
  width: 0.1%;
}
.post {
  list-style: none;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.fetched-title {
  margin: 0;
}
.link-text {
  color: #828282;
}

</style>