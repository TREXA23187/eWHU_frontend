import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Switch, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { t } from 'i18next';
import { ls } from '@/utils/storage';

export default function NewsInfoModal(props) {
    const { data, visible, currentTab, onCancel } = props;
    const userInfo = ls.get('user');

    const [fileList, setFileList] = useState(data.background_picture || []);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [form] = Form.useForm();

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{t('上传')}</div>
        </div>
    );

    useEffect(() => {
        console.log(data);
        setFileList(data?.background_picture || []);
    }, [data]);

    const handlePreview = async file => {
        setPreviewImage(file.thumbUrl);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    return (
        <Modal
            title={t('添加资讯')}
            visible={visible}
            destroyOnClose
            footer={null}
            onCancel={onCancel}
            style={{ position: 'absolute', top: currentTab === 'school' ? 10 : 30, left: '50%', marginLeft: -260 }}>
            <Form {...layout} form={form} autoComplete='off'>
                <Form.Item label={t('标题')} name='title' rules={[{ required: true, message: t('请输入标题') }]}>
                    <span>{data.title}</span>
                </Form.Item>
                <Form.Item label={t('描述')} name='desc' rules={[{ required: true, message: '请输入详细描述' }]}>
                    <span>{data.desc}</span>
                </Form.Item>
                <Form.Item
                    label={t('背景图片')}
                    name='background_picture'
                    rules={[{ required: true, message: '请添加背景图片' }]}>
                    <Upload
                        action='/api/feedback/img'
                        listType='picture-card'
                        disabled
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}>
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                <Form.Item label={t('网页链接')} name='web_url' rules={[{ required: true, message: '请输入网页链接' }]}>
                    <span>{data.website}</span>
                </Form.Item>
                {currentTab === 'school' && (
                    <Form.Item
                        label={t('发布院系')}
                        name='publish_depart'
                        rules={[{ required: true, message: '请选择发布院系' }]}>
                        <span>{data.title}</span>
                    </Form.Item>
                )}
                <Form.Item label={t('是否发布')} name='is_published'>
                    <Switch checked={data.is_published} disabled />
                </Form.Item>
                <Form.Item label={t('是否置顶')} name='is_top'>
                    <Switch checked={data.is_top} disabled />
                </Form.Item>
                <Form.Item label={t('备注')} name='remark'>
                    <span>{data.remark}</span>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type='primary' onClick={onCancel}>
                        {t('知道了')}
                    </Button>
                </Form.Item>
            </Form>
            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}>
                <img alt='example' style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Modal>
    );
}
