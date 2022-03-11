import React from 'react'
import { Modal, Button, Form, Input, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { query } from '@/utils/map'

const Option = Select.Option

export default function SearchDataModel(props) {
    const { map, visible, onClose } = props
    const { t, i18n } = useTranslation()

    const onFinish = async values => {
        const { dataName, dataFilter } = values
        await query(map, dataName, dataFilter)
        onClose()
    }

    const handleChange = value => {
        console.log(`selected ${value}`)
    }

    return (
        <Modal title={t('数据查询')} visible={visible} destroyOnClose okText={'查询'} footer={null}>
            <Form initialValues={{ dataName: 'POI' }} onFinish={onFinish} autoComplete='off'>
                <Form.Item
                    label='数据名称'
                    name='dataName'
                    rules={[{ required: true, message: 'Please input your username!' }]}>
                    <Select style={{ width: 120 }} onChange={handleChange}>
                        <Option value='POI'>POI</Option>
                        <Option value='学校范围'>学校范围</Option>
                        <Option value='建筑'>建筑</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label='sql语句'
                    name='dataFilter'
                    rules={[{ required: true, message: 'Please input your password!' }]}>
                    <Input placeholder='例如 id = 213' />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type='primary' htmlType='submit'>
                        {t('查询')}
                    </Button>
                    <Button style={{ marginLeft: 12 }} onClick={onClose}>
                        {t('取消')}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}
