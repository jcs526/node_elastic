<template>
  <div>
    <div
      v-for="(comment, index) in ordered"
      :key="index"
      v-bind:style="{
        border: '1px solid black',
        paddingLeft: `${comment.depth * 20}px`,
      }"
    >
      <div @click="focusON(index)">
        <div>{{ comment.name }}</div>
        <div>date : {{ comment.date }}</div>
        <div>{{ comment.content }}</div>
        <div>depth : {{ comment.depth }}</div>
      </div>
      <div v-if="focus == index">
        <form @submit.prevent="writeComent(comment.depth, comment.name)">
          작성자 : <input type="text" name="name" /> 내용 :
          <input type="text" name="content" />
          <button type="submit">제출!</button>
        </form>
      </div>
    </div>
    <form @submit.prevent="writeComent(0, 'main')">
      작성자 : <input type="text" name="name" /> 내용 :
      <input type="text" name="content" />
      <button type="submit">제출!</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      content: "",
      uuid: self.crypto.randomUUID(),
      disorder: [],
      ordered: [],
      focus: -1,
    };
  },
  computed: {},

  methods: {
    focusON(index) {
      this.focus = this.focus === index ? -1 : index;
    },
    writeComent(depth, parent) {
      let data = {
        name: event.target.name.value,
        content: event.target.content.value,
        parent,
        depth: depth + 1,
      };
      axios.post("http://127.0.0.1:19901/comment", data);
    },
    dataInput() {
      this.disorder.push({
        name: this.name,
        content: this.content,
        date: new Date(),
      });
    },
    startOrder() {
      this.computed = [];
      this.order("main", 1);
    },
    order(parent, depth) {
      this.disorder
        .filter((v) => {
          if (v.depth === depth && v.parent === parent) {
            return v;
          }
        })
        .sort((a, b) => {
          a.date - b.date;
        })
        .forEach((v) => {
          this.computed.push(v);
        });
    },
  },

  mounted() {
    axios.get("http://127.0.0.1:19901/comment").then((res) => {
      console.log(res.data);
      this.ordered = res.data;
    });
  },
};
</script>

<style>
</style>
