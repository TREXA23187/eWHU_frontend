import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, message, Switch, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { t } from 'i18next';
import { ls } from '@/utils/storage';
import { addNews } from '@/api/news';

const Option = Select.Option;

const schoolList = [
    {
        id: 1,
        title: '资源与环境科学学院',
        website: 'http://sres.whu.edu.cn/'
    },
    { id: 2, title: '法学院', website: 'http://sres.whu.edu.cn/' },
    { id: 3, title: '经济与管理学院', website: 'http://sres.whu.edu.cn/' },
    { id: 4, title: '土木建筑工程学院', website: 'http://sres.whu.edu.cn/' },
    { id: 5, title: '遥感信息工程学院', website: 'http://sres.whu.edu.cn/' },
    { id: 6, title: '马克思主义学院', website: 'http://sres.whu.edu.cn/' }
];

export default function AddNewsModal(props) {
    const { visible, currentTab, onCancel, onUpdate } = props;
    const userInfo = ls.get('user');

    const [fileList, setFileList] = useState([]);
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

    const handlePreview = async file => {
        setPreviewImage(file.thumbUrl);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    const onFinish = async values => {
        const data = {
            ...values,
            publisher: userInfo.username,
            background_picture: values.background_picture.fileList
        };
        const res = await addNews(data);

        if (res.code === 0) {
            onUpdate();
            onCancel();
        }
    };

    return (
        <Modal
            title={t('添加资讯')}
            visible={visible}
            destroyOnClose
            footer={null}
            onCancel={onCancel}
            style={{ position: 'absolute', top: currentTab === 'school' ? 10 : 30, left: '50%', marginLeft: -260 }}>
            <Form {...layout} form={form} onFinish={onFinish} autoComplete='off'>
                <Form.Item label={t('标题')} name='title' rules={[{ required: true, message: t('请输入标题') }]}>
                    <Input />
                </Form.Item>
                <Form.Item label={t('描述')} name='desc' rules={[{ required: true, message: '请输入详细描述' }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('背景图片')}
                    name='background_picture'
                    rules={[{ required: true, message: '请添加背景图片' }]}>
                    <Upload
                        action='/api/feedback/img'
                        listType='picture-card'
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}>
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                <Form.Item label={t('网页链接')} name='web_url' rules={[{ required: true, message: '请输入网页链接' }]}>
                    <Input />
                </Form.Item>
                {currentTab === 'school' && (
                    <Form.Item
                        label={t('发布院系')}
                        name='publish_depart'
                        rules={[{ required: true, message: '请选择发布院系' }]}>
                        <Select>
                            {schoolList.map(item => (
                                <Option value={item.title} key={item.id}>
                                    {item.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <Form.Item label={t('是否发布')} name='is_published'>
                    <Switch />
                </Form.Item>
                <Form.Item label={t('是否置顶')} name='is_top'>
                    <Switch />
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
