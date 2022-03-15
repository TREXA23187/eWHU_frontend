import AsyncLoadable from '@/utils/AsyncLoadable';

// 首页
const Index = AsyncLoadable(() => import(/* webpackChunkName: 'index' */ '@/views/Index'));

// 用户管理
const User = AsyncLoadable(() => import(/* webpackChunkName: 'user' */ '@/views/User'));

// 地图
const Map = AsyncLoadable(() => import(/* webpackChunkName: 'map' */ '@/views/Map'));

// 用户反馈
const Feedback = AsyncLoadable(() => import(/* webpackChunkName: 'user' */ '@/views/Feedback'));

//关于
const About = AsyncLoadable(() => import(/* webpackChunkName: 'about' */ '@/views/About'));

const routes = [
    { path: '/index', exact: true, name: '首页', component: Index },
    { path: '/user', exact: false, name: '用户管理', component: User, auth: [1, 2] },
    { path: '/map', exact: false, name: '地图', component: Map },
    { path: '/feedback', exact: false, name: '用户反馈', component: Feedback, auth: [1, 2] },
    { path: '/about', exact: false, name: '关于', component: About }
];

export default routes;
