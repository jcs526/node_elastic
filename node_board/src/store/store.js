import Vue from 'vue';
import Vuex from 'vuex';
import { fetch_delete, fetch_search, fetch_modify, fetch_write } from '../api/api';
import { router } from '../routes/index'
import bus from '../utils/bus.js'

Vue.use(Vuex);



export const store = new Vuex.Store({
    state: {
        boardList: [],
        article: {},
    },

    mutations: {
        SET_BOARD_LIST(state, data) {
            state.boardList = data;
        },
        SET_ARTICLE(state, data) {
            state.article = data;
        }
    },

    getters: {
        getBoardList(state) {
            return state.boardList;
        },

        getArticle(state) {
            return state.article;
        }
    },

    actions: {

        search(context, { searchValue, selectOption, routerName }) {
            bus.$emit('start:spinner');
            fetch_search(searchValue, selectOption)
                .then((res) => {
                    context.commit('SET_BOARD_LIST', res.data);
                    if (routerName !== "SearchList")
                        router.push('/search');
                    bus.$emit('end:spinner');
                });
        },
        delete(context, id) {
            bus.$emit('start:spinner');
            fetch_delete(id)
                .then((res) => {
                    console.log(res);
                })
                .then(
                    setTimeout(() => {
                        router.push('/list')
                        bus.$emit('end:spinner');
                    }, 1500));
        },


        modifyBoard(context, { article, textAreaValue }) {
            bus.$emit('start:spinner');
            fetch_modify(article, textAreaValue)
                .then(
                    setTimeout(() => {
                        router.push("/list");
                        bus.$emit('end:spinner');
                    }, 1500)
                );
        },

        writeArticle(context, { data }) {
            console.log("store",data);
            bus.$emit('start:spinner');
            fetch_write(data)
                .then((res) => {
                    console.log("res:", res);
                    router.push("/list");
                    bus.$emit('end:spinner');
                });
        }
    },
},

)