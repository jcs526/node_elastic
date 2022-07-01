<template>
  <div>
    <table>
      <tr>
        <th>제목</th>
        <th>작성자</th>
        <th>시간</th>
      </tr>
      <tr v-for="(item, index) in boardList" :key="index">
      <router-link to="/article">
        <td  @click="selectAritcle(item)">{{ item.title }}</td>
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
}
</style>