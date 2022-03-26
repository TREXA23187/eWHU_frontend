import React from 'react';
import { Table, Tag, Button, message } from 'antd';
import { t } from 'i18next';
import moment from 'moment';
import { deleteNews } from '@/api/news';

export default function UniNewsTable(props) {
    const { data, onUpdate, onModalShow } = props;

    const columns = [
        // {
        //     title: '发布者',
        //     dataIndex: 'publisher',
        //     key: 'publisher'
        // },
        {
            title: '发布院系',
            dataIndex: 'publish_depart',
            key: 'publish_depart'
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: '20%'
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render(date) {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        {
            title: '是否发布',
            dataIndex: 'is_published',
            key: 'is_published',
            render(text, record) {
                return <Tag color={text ? 'green' : 'volcano'}>{text ? t('已发布') : t('未发布')}</Tag>;
            }
        },
        {
            title: '是否置顶',
            dataIndex: 'is_top',
            key: 'is_top',
            render(text, record) {
                return <Tag color={text ? 'green' : 'volcano'}>{text ? t('已置顶') : t('未置顶')}</Tag>;
            }
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => {
                return (
                    <div>
                        <Button type='text' style={{ color: 'blue' }} onClick={() => onModalShow(record)}>
                            {t('详情')}
                        </Button>
                        <Button
                            type='text'
                            danger
                            onClick={async () => {
                                const res = await deleteNews({ id: record.id });
                                message.success(res.message);
                                onUpdate();
                            }}>
                            {t('删除')}
                        </Button>
                    </div>
                );
            }
        }
    ];

    return <Table columns={columns} dataSource={data} pagination={{ defaultPageSize: 5 }} rowKey='id' />;
}
