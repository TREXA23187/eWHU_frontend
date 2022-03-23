import React from 'react';
import { Layout, Divider } from 'antd';
import WebBreadcrumb from '@/components/WebBreadcrumb';

export default function NewsView() {
    return (
        <Layout>
            <div className='base-style'>
                <h3>News</h3>
                <Divider />
            </div>
        </Layout>
    );
}
