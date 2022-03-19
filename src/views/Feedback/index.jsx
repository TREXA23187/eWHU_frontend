import React, { useState } from 'react';
import { Layout, Input, Table, message, Space, Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import './index.less';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleTwoTone, CheckCircleTwoTone, DownOutlined, MinusCircleTwoTone } from '@ant-design/icons';
import moment from 'moment';
import AddFeedbackModel from '@/components/Feedback/add-feedback-modal';
import FeedbackInfoDrawer from '@/components/Feedback/feedback-info-drawer';
import { useRequest } from '@umijs/hooks';
import { getFeedbackList, changeStatus } from '@/api/feedback';

const Option = Select.Option;
const { RangePicker } = DatePicker;

export default function FeedbackView() {
    const { t } = useTranslation();
    // const [date, setDate] = useState([moment('2022-03-02'), moment('2022-04-29')]);
    const [visible, setVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);
    const [detail, setDetail] = useState({});

    const [selectedType, setSelectedType] = useState('all');
    const [nameInput, setNameInput] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const [feedbackFilter, setFeedbackFilter] = useState({});

    const { data: feedbackList, run } = useRequest(async filter => {
        const res = await getFeedbackList({
            // ...feedbackFilter,
            ...filter
        });
        return res.data.feedback_list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    });

    const handleMenuClick = async (e, id) => {
        const res = await changeStatus({ id, status: parseInt(e.key) });
        if (res.code === 0) {
            message.success(res.message);
            run({});
        }
    };

    const menu = record => {
        return (
            <Menu onClick={e => handleMenuClick(e, record.id)} style={{ width: 82 }}>
                <Menu.Item key={1}>{t('标记解决')}</Menu.Item>
                <Menu.Item key={2}>{t('无需处理')}</Menu.Item>
            </Menu>
        );
    };

    const columns = [
        {
            title: t('用户名'),
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: t('学号/工号'),
            dataIndex: 'school_id',
            key: 'school_id'
        },
        {
            title: t('反馈地址'),
            dataIndex: 'address',
            key: 'address',
            width: '20%'
        },
        {
            title: t('反馈类型'),
            key: 'type',
            dataIndex: 'type',
            render: type => <>{problemType[type]}</>
        },
        {
            title: t('反馈状态'),
            dataIndex: 'status',
            key: 'status',
            render(status) {
                switch (status) {
                    case 0:
                        return (
                            <div>
                                <ExclamationCircleTwoTone twoToneColor='#ff7d01' style={{ marginRight: 5 }} />
                                {t('待处理')}
                            </div>
                        );
                    case 1:
                        return (
                            <div>
                                <CheckCircleTwoTone twoToneColor='#52c41a' style={{ marginRight: 5 }} />
                                {t('已解决')}
                            </div>
                        );
                    case 2:
                        return (
                            <div>
                                <MinusCircleTwoTone twoToneColor='#86909c' style={{ marginRight: 5 }} />
                                {t('无需处理')}
                            </div>
                        );
                    default:
                        break;
                }
            }
        },
        {
            title: t('创建时间'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render(date) {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        {
            title: t('操作'),
            key: 'action',
            render: (text, record) => (
                <Space size='middle'>
                    <Dropdown overlay={() => menu(record)} trigger='click'>
                        <Button type='text' style={{ color: '#175eff' }}>
                            {t('处理')}
                            <DownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
                        </Button>
                    </Dropdown>
                    <Button
                        type='text'
                        style={{ color: '#175eff' }}
                        onClick={() => {
                            setVisible(true);
                            setDetail(record);
                        }}>
                        {t('详细信息')}
                    </Button>
                </Space>
            )
        }
    ];

    const problemType = {
        logistics: t('后勤报修'),
        network: t('网络报修'),
        suggestion: t('优化建议'),
        other: t('其他')
    };

    return (
        <Layout>
            <div className='base-style'>
                <Space style={{ marginBottom: 16 }}>
                    <div style={{ marginLeft: 2, minWidth: 195 }}>
                        <span className='label'>{t('问题类型')}:</span>
                        <Select
                            style={{ width: 120 }}
                            defaultValue={selectedType}
                            style={{ width: 100, height: 30 }}
                            onChange={value => {
                                setSelectedType(value);
                                // setFeedbackFilter(pre => ({ ...pre, type: value === 'all' ? '' : value }));
                                run({
                                    type: value === 'all' ? '' : value,
                                    username: nameInput,
                                    createdAtStart: selectedDate ? new Date(moment(selectedDate[0]).valueOf()) : '',
                                    createdAtEnd: selectedDate ? new Date(moment(selectedDate[1]).valueOf()) : ''
                                });
                            }}>
                            <Option value='all'>{t('全部')}</Option>
                            <Option value='logistics'>{t('后勤报修')}</Option>
                            <Option value='network'>{t('网络报修')}</Option>
                            <Option value='suggestion'>{t('优化建议')}</Option>
                            <Option value='other'>{t('其他')}</Option>
                        </Select>
                    </div>
                    <div style={{ marginLeft: 2, minWidth: 220 }}>
                        <span className='label'>{t('姓名')}:</span>
                        <Input
                            placeholder={t('搜索用户')}
                            style={{ width: 150 }}
                            value={nameInput}
                            onChange={e => {
                                setNameInput(e.target.value);
                                // setFeedbackFilter(pre => ({ ...pre, username: e.target.value }));
                                run({
                                    username: e.target.value,
                                    type: selectedType === 'all' ? '' : selectedType,
                                    createdAtStart: selectedDate ? new Date(moment(selectedDate[0]).valueOf()) : '',
                                    createdAtEnd: selectedDate ? new Date(moment(selectedDate[1]).valueOf()) : ''
                                });
                            }}></Input>
                    </div>
                    <div style={{ marginLeft: 2, minWidth: 450 }}>
                        <span className='label'>{t('反馈时间')}:</span>
                        <RangePicker
                            onChange={(value, dateString) => {
                                // setFeedbackFilter(pre => ({ ...pre, username: e.target.value }));
                                setSelectedDate(value);
                                if (value) {
                                    run({
                                        username: nameInput,
                                        type: selectedType === 'all' ? '' : selectedType,
                                        createdAtStart: new Date(moment(value[0]).valueOf()),
                                        createdAtEnd: new Date(moment(value[1]).valueOf())
                                    });
                                }
                            }}
                            value={selectedDate}
                            placeholder={[t('开始时间'), t('结束时间')]}
                        />
                    </div>
                    <div>
                        <Button onClick={() => setAddVisible(true)}>{t('添加反馈')}</Button>
                    </div>
                </Space>
                <Table columns={columns} dataSource={feedbackList} pagination={{ defaultPageSize: 5 }} rowKey='id' />
            </div>
            <AddFeedbackModel
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onUpdate={() => run({})}
                data={detail}
            />
            <FeedbackInfoDrawer
                visible={visible}
                onClose={() => setVisible(false)}
                onUpdate={() => run({})}
                data={detail}
            />
        </Layout>
    );
}
