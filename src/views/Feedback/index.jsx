import React, { useState } from 'react';
import { Layout, Input, Table, Tag, Space, Select, DatePicker, Button, Dropdown, Menu } from 'antd';
import './index.less';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleTwoTone, CheckCircleTwoTone, DownOutlined, MinusCircleTwoTone } from '@ant-design/icons';
import moment from 'moment';

const Option = Select.Option;
const { RangePicker } = DatePicker;

const problemType = {
    logistics: '后勤报修',
    network: '网络报修',
    suggestion: '优化建议',
    other: '其他'
};

export default function FeedbackView() {
    const { t } = useTranslation();
    // const [date, setDate] = useState([moment('2022-03-02'), moment('2022-04-29')]);
    const [date, setDate] = useState(null);

    const menu = (
        <Menu onClick={handleMenuClick} style={{ width: 82 }}>
            <Menu.Item key='1'>{t('标记解决')}</Menu.Item>
            <Menu.Item key='2'>{t('无需处理')}</Menu.Item>
        </Menu>
    );

    function handleMenuClick(e) {
        // message.info('Click on menu item.');
        console.log('click', e);
    }

    const columns = [
        {
            title: t('姓名'),
            dataIndex: 'name',
            key: 'name'
        },

        {
            title: t('反馈地址'),
            dataIndex: 'address',
            key: 'address'
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
            dataIndex: 'create_date',
            key: 'create_date',
            render(date) {
                return moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        {
            title: t('操作'),
            key: 'action',
            render: () => (
                <Space size='middle'>
                    <Dropdown overlay={menu} trigger='click'>
                        <Button type='text' style={{ color: '#175eff' }}>
                            {t('处理')}
                            <DownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
                        </Button>
                    </Dropdown>
                    <Button type='text' style={{ color: '#175eff' }}>
                        {t('详细信息')}
                    </Button>
                </Space>
            )
        }
    ];

    const data = [
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            type: ['nice', 'developer'],
            status: 0,
            create_date: 1647333610385,
            type: 'logistics'
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            type: ['loser'],
            status: 1,
            create_date: 1647333310385,
            type: 'network'
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
            type: ['cool', 'teacher'],
            status: 2,
            create_date: 1647133610385,
            type: 'other'
        }
    ];

    const onChange = (value, dateString) => {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
        setDate(value);
    };

    return (
        <Layout>
            <div className='base-style'>
                <Space style={{ marginBottom: 16 }}>
                    <div style={{ marginLeft: 2 }}>
                        <span className='label'>问题类型:</span>
                        <Select style={{ width: 120 }} defaultValue='all' style={{ width: 100, height: 30 }}>
                            <Option value='all'>全部</Option>
                            <Option value='logistics'>后勤报修</Option>
                            <Option value='network'>网络报修</Option>
                            <Option value='suggestion'>优化建议</Option>
                            <Option value='other'>其他</Option>
                        </Select>
                    </div>
                    <div style={{ marginLeft: 550 }}>
                        <span className='label'>姓名:</span>
                        <Input style={{ width: 150 }}></Input>
                    </div>
                    <div style={{ marginLeft: 2 }}>
                        <span className='label'>反馈时间:</span>
                        <RangePicker onChange={onChange} value={date} placeholder={[t('开始时间'), t('结束时间')]} />
                    </div>
                </Space>
                <Table columns={columns} dataSource={data} />
            </div>
        </Layout>
    );
}
