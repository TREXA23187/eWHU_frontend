import React, { useState } from 'react';
import { Layout, Button, Tabs, Switch } from 'antd';
import { t } from 'i18next';
import UniNewsTab from '@/components/News/uni-news-tab';
import SchoolInfoTab from '@/components/News/school-info-tab';
import AddNewsModal from '@/components/News/add-news-modal';
import { useRequest } from '@umijs/hooks';
import { getNewsList } from '@/api/news';

const { TabPane } = Tabs;

export default function NewsView() {
    const [previewType, setPreviewType] = useState(false);
    const [visible, setVisible] = useState(false);
    const [activeKey, setActiveKey] = useState('university');

    const { data, run } = useRequest(async () => {
        const res = await getNewsList();
        if (res.code === 0) {
            return res.data;
        }
    });

    return (
        <Layout>
            <div className='base-style' style={{ height: 650 }}>
                <Tabs
                    defaultActiveKey='university'
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    centered
                    tabBarExtraContent={{
                        left: (
                            <>
                                <Button onClick={() => setVisible(true)}>{t('添加资讯')}</Button>
                            </>
                        ),
                        right: (
                            <>
                                <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 13, marginRight: 10 }}>
                                    {t('预览模式')}
                                </span>
                                <Switch checked={previewType} onChange={setPreviewType} />
                            </>
                        )
                    }}>
                    <TabPane tab={t('学校要闻')} key='university' style={{ height: 570, overflow: 'scroll' }}>
                        {<UniNewsTab isPreview={previewType} data={data} onUpdate={run} />}
                    </TabPane>
                    <TabPane tab={t('院系资讯')} key='school' style={{ height: 570, overflow: 'scroll' }}>
                        <SchoolInfoTab isPreview={previewType} data={data} onUpdate={run} />
                    </TabPane>
                </Tabs>
            </div>
            <AddNewsModal
                visible={visible}
                onCancel={() => {
                    setVisible(false);
                    run();
                }}
                onUpdate={run}
                currentTab={activeKey}
            />
        </Layout>
    );
}
