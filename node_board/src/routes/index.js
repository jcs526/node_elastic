import Vue from 'vue';
import VueRouter from 'vue-router';
import BoardList from '../components/BoardList'
import WriteArticle from '../components/WriteArticle'
import ReadArticle from '../components/ReadArticle'
import ModifyArticle from '../components/ModifyArticle'
import StreamTest from '../components/StreamTest'
import StreamTest2 from '../components/StreamTest2'
import StreamTest3 from '../components/StreamTest3'
import StreamTest4 from '../components/StreamTest4'
import ExcelDownload from '../components/ExcelDownload'
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
        {
            path: '/stream',
            component: StreamTest,
            name: 'StreamTest',
        },
        {
            path: '/stream2',
            component: StreamTest2,
            name: 'StreamTest2',
        },
        {
            path: '/stream3',
            component: StreamTest3,
            name: 'StreamTest3',
        },
        {
            path: '/stream4',
            component: StreamTest4,
            name: 'StreamTest4',
        },
        {
            path: '/excel',
            component: ExcelDownload,
            name: 'ExcelDownload',
        },
    ]
})