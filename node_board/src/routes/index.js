import Vue from 'vue';
import VueRouter from 'vue-router';
import BoardList from '../components/BoardList'
import WriteArticle from '../components/WriteArticle'
import ReadArticle from '../components/ReadArticle'
import ModifyArticle from '../components/ModifyArticle'
import { store } from '../store/store'

Vue.use(VueRouter);

export const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: "/list"
        },
        {
            path: '/list',
            component: BoardList,
            name: 'BoardList',
            beforeEnter: (to, from, next) => {
                store.dispatch("search", { searchValue: "", selectOption: "title" })
                .then(next());
            }
        },
        {
            path: '/search',
            component: BoardList,
            name: 'SearchList',
        },
        {
            path: '/write',
            component: WriteArticle,
            name: 'WriteArticle',
        },
        {
            path: '/article',
            component: ReadArticle,
            name: 'ReadArticle'
        },
        {
            path: '/modify',
            component: ModifyArticle,
            name: 'ModifyArticle'
        },
    ]
})