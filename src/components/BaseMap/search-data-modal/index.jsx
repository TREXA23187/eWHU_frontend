import React from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { query } from '@/utils/map';

const Option = Select.Option;

export default function SearchDataModel(props) {
    const { map, visible, onCancel, onShow } = props;
    const { t, i18n } = useTranslation();

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    const onFinish = async values => {
        const { dataName, dataFilter } = values;
        console.log(2312312312, values);
        const res = await query(map, dataFilter);
        const locationList = res.features.map(item => {
            const [lon, lat] = item.geometry.coordinates;
            return {
                id: item.id,
                name: '自强超市',
                location: `${lat},${lon}`
            };
        });
        console.log(67676767, locationList);
        onShow(locationList);
        onCancel();
    };

    return (
        <Modal title={t('数据查询')} visible={visible} destroyOnClose footer={null} onCancel={onCancel}>
            <Form
                {...layout}
                initialValues={{ dataName: 'POI', dataFilter: '自强超市' }}
                onFinish={onFinish}
                autoComplete='off'>
                <Form.Item
                    label={t('数据名称')}
                    name='dataName'
                    rules={[{ required: true, message: t('请输入数据名称') }]}>
                    <Select style={{ width: 120 }}>
                        <Option value='POI'>POI</Option>
                        <Option value='boundary'>学校范围</Option>
                        <Option value='building'>建筑</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label={t('SQL语句')}
                    name='dataFilter'
                    rules={[{ required: true, message: t('请输SQL语句') }]}>
                    <Input placeholder={t('例如 name = "自强超市"')} />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type='primary' htmlType='submit'>
                        {t('查询')}
                    </Button>
                    <Button style={{ marginLeft: 12 }} onClick={onCancel}>
                        {t('取消')}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
