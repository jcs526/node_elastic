<template>
  <div>
    <div
      v-for="(comment, index) in ordered"
      :key="index"
      v-bind:style="{
        border: '1px solid black',
        paddingLeft: `${(comment.depth - 1) * 20}px`,
      }"
    >
      <div @click="focusON(index)">
        <div>{{ comment.name }}</div>
        <div>date : {{ comment.date }}</div>
        <div>{{ comment.content }}</div>
        <div>depth : {{ comment.depth }}</div>
        <button @click="deleteComment(comment.uuid)">삭제</button>
      </div>
      <div v-if="focus == index">
        <form @submit.prevent="writeComent(comment.depth, comment.uuid)">
          내용 :
          <input type="text" name="content" />
          <button type="submit">제출!</button>
        </form>
      </div>
    </div>
    <form @submit.prevent="writeComent(0, 'main')">
      내용 :
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
      ordered: [],
      focus: -1,
    };
  },
  computed: {},

  methods: {
    deleteComment(uuid) {
      event.stopPropagation()
      let data = {
        uuid:uuid
      };
      axios.post("http://127.0.0.1:19901/deleteComment", data)
      .then((res) => {
        console.log(res.data);
        this.ordered = res.data;
      });
    },
    focusON(index) {
      this.focus = this.focus === index ? -1 : index;
    },
    writeComent(depth, parent) {
      let form = event.target;
      let data = {
        name: this.$store.state.userId,
        content: form.content.value,
        parent,
        depth: depth + 1,
        uuid: self.crypto.randomUUID(),
      };
      axios.post("http://127.0.0.1:19901/comment", data).then((res) => {
        console.log(res.data);
        this.ordered = res.data;
        form.name.value = "";
        form.content.value = "";
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
