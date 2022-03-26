import React from 'react';
import { Modal, Button, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { addUser, changeUserInfo } from '@/api/user';

const Option = Select.Option;

export default function AddUserModal(props) {
    const { data, type, visible, onCancel } = props;
    const { t } = useTranslation();

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    const onFinish = async values => {
        if (type === 'add') {
            const res = await addUser(values);
            message.success(res.message);
        } else {
            const res = await changeUserInfo({ id: data.id, ...values });
            message.success(res.message);
        }
        onCancel();
    };

    return (
        <Modal title={t('添加用户')} visible={visible} destroyOnClose footer={null} onCancel={onCancel}>
            <Form {...layout} initialValues={{ role: 0, remark: '', ...data }} onFinish={onFinish} autoComplete='off'>
                <Form.Item label={t('用户名')} name='username' rules={[{ required: true, message: t('请输入用户名') }]}>
                    <Input />
                </Form.Item>
                {type === 'add' && (
                    <Form.Item label={t('密码')} name='password' rules={[{ required: true, message: t('请输入密码') }]}>
                        <Input.Password />
                    </Form.Item>
                )}
                <Form.Item label={t('角色')} name='role' rules={[{ required: true, message: t('请选择角色') }]}>
                    <Select style={{ width: 120 }}>
                        <Option value={0}>{t('普通用户')}</Option>
                        <Option value={1}>{t('管理员')}</Option>
                        <Option value={2}>{t('超级管理员')}</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('学号/工号')}
                    name='school_id'
                    rules={[{ required: true, message: '请输入学号/工号' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label={t('手机号')} name='phone_number'>
                    <Input />
                </Form.Item>
                <Form.Item label={t('邮箱')} name='email'>
                    <Input />
                </Form.Item>
                <Form.Item label={t('备注')} name='remark'>
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type='primary' htmlType='submit'>
                        {t('确定')}
                    </Button>
                    <Button style={{ marginLeft: 12 }} onClick={onCancel}>
                        {t('取消')}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
