import React from 'react';
import { HomeOutlined, CompassOutlined, TeamOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

const menus = [
    {
        key: '/index',
        title: '首页',
        icon: <HomeOutlined />
    },
    {
        key: '/user',
        title: '用户管理',
        icon: <TeamOutlined />,
        auth: [1, 2]
    },
    {
        key: '/map',
        title: '地图',
        icon: <CompassOutlined />
    },
    {
        key: '/feedback',
        title: '用户反馈',
        icon: <MailOutlined />
    },
    {
        title: '关于',
        key: '/about',
        icon: <UserOutlined />
    }
];

export const routesNameMap = {
    '/index': '首页',
    '/user': '用户管理',
    '/map': '地图',
    '/feedback': '用户反馈',
    '/about': '关于'
};

export default menus;
