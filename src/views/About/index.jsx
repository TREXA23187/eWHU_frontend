import React from 'react';
import { Layout, Divider } from 'antd';
import WebBreadcrumb from '@/components/WebBreadcrumb';

export default function AboutView() {
    return (
        <Layout>
            <div className='base-style'>
                <h3>关于作者</h3>
                <Divider />
                <p>这个人很懒，什么都没有留下……</p>
            </div>
        </Layout>
    );
}
