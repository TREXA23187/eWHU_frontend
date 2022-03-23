import AsyncLoadable from '@/utils/AsyncLoadable';

// 首页
const Index = AsyncLoadable(() => import(/* webpackChunkName: 'index' */ '@/views/Index'));

// 地图
const Map = AsyncLoadable(() => import(/* webpackChunkName: 'map' */ '@/views/Map'));

// 用户管理
const User = AsyncLoadable(() => import(/* webpackChunkName: 'user' */ '@/views/User'));

// 用户反馈
const Feedback = AsyncLoadable(() => import(/* webpackChunkName: 'user' */ '@/views/Feedback'));

// 应用管理
const Application = AsyncLoadable(() => import(/* webpackChunkName: 'map' */ '@/views/Application'));

// 资讯发布
const News = AsyncLoadable(() => import(/* webpackChunkName: 'map' */ '@/views/News'));

//关于
const About = AsyncLoadable(() => import(/* webpackChunkName: 'about' */ '@/views/About'));

const routes = [
    { path: '/index', exact: true, name: '首页', component: Index },
    { path: '/map', exact: false, name: '地图', component: Map },
    { path: '/user', exact: false, name: '用户管理', component: User, auth: [1, 2] },
    { path: '/feedback', exact: false, name: '用户反馈', component: Feedback, auth: [1, 2] },
    { path: '/application', exact: false, name: '应用管理', component: Application, auth: [1, 2] },
    { path: '/news', exact: false, name: '资讯发布', component: News, auth: [1, 2] },
    { path: '/about', exact: false, name: '关于', component: About }
];

export default routes;
