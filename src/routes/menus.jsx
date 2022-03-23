import React from 'react';
import {
    HomeOutlined,
    CompassOutlined,
    TeamOutlined,
    UserOutlined,
    MailOutlined,
    AppstoreOutlined,
    ProfileOutlined
} from '@ant-design/icons';

const menus = [
    {
        key: '/index',
        title: '首页',
        icon: <HomeOutlined />
    },
    {
        key: '/map',
        title: '地图',
        icon: <CompassOutlined />
    },
    {
        key: '/user',
        title: '用户管理',
        icon: <TeamOutlined />,
        auth: [1, 2]
    },
    {
        key: '/feedback',
        title: '用户反馈',
        icon: <MailOutlined />,
        auth: [1, 2]
    },
    {
        key: '/application',
        title: '应用管理',
        icon: <AppstoreOutlined />,
        auth: [1, 2]
    },
    {
        key: '/news',
        title: '资讯发布',
        icon: <ProfileOutlined />,
        auth: [1, 2]
    },
    {
        title: '关于',
        key: '/about',
        icon: <UserOutlined />
    }
];

export const routesNameMap = {
    '/index': '首页',
    '/map': '地图',
    '/user': '用户管理',
    '/feedback': '用户反馈',
    '/application': '应用管理',
    '/news': '资讯发布',
    '/about': '关于'
};

export default menus;
