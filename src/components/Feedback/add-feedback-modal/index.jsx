import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, Upload, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { addFeedback } from '@/api/feedback';
import { ls } from '@/utils/storage';

const Option = Select.Option;
const { TextArea } = Input;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default function AddFeedbackModel(props) {
    const { data, visible, onClose, onUpdate } = props;
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [initValues, setInitValues] = useState({ type: 'logistics', info_picture: [], remark: '', ...data });

    const [fileList, setFileList] = useState(data?.info_picture || []);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const userInfo = ls.get('user');

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    useEffect(() => {
        setInitValues({ type: 'logistics', info_picture: [], remark: '', ...data });
    }, [visible]);

    const onSubmit = async () => {
        const values = await form.validateFields();
        const info_picture = values.info_picture?.fileList || [];
        const coordinates = [values.latitude.trim(), values.longitude.trim()];
        const param = {
            ...values,
            username: userInfo.username,
            school_id: userInfo.school_id,
            info_picture,
            coordinates
        };
        console.log(param);
        const res = await addFeedback(param);
        if (res.code === 0) {
            onClose();
            onUpdate();
        }
    };

    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        // setPreviewImage(file.url || file.preview);
        // setPreviewVisible(true);
        // setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };
    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Drawer
            title={t('添加反馈')}
            visible={visible}
            destroyOnClose
            footer={null}
            onClose={onClose}
            width='500'
            extra={
                <>
                    <Button onClick={onClose}>{t('取消')}</Button>
                    <Button style={{ marginLeft: 12 }} type='primary' onClick={onSubmit}>
                        {t('确定')}
                    </Button>
                </>
            }>
            <Form {...layout} form={form} initialValues={initValues} autoComplete='off'>
                <Form.Item label={t('反馈地址')} name='address' rules={[{ required: true, message: '请输入反馈地址' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label={t('反馈类型')} name='type' rules={[{ required: true }]}>
                    <Select style={{ width: 120 }} style={{ width: 100, height: 30 }}>
                        <Option value='logistics'>{t('后勤报修')}</Option>
                        <Option value='network'>{t('网络报修')}</Option>
                        <Option value='suggestion'>{t('优化建议')}</Option>
                        <Option value='other'>{t('其他')}</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('详细信息')}
                    name='info_detail'
                    rules={[{ required: true, message: '请输入详细信息' }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('位置(纬度)')}
                    name='latitude'
                    rules={[{ required: true, message: '请输入坐标纬度' }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('位置(经度)')}
                    name='longitude'
                    rules={[{ required: true, message: '请输入坐标经度' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label={t('详细图片')} name='info_picture'>
                    <Upload
                        action='/api/feedback/img'
                        listType='picture-card'
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}>
                        {fileList.length >= 4 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                <Form.Item label={t('备注')} name='remark'>
                    <TextArea showCount maxLength={100} autoSize={{ minRows: 3, maxRows: 5 }} />
                </Form.Item>
            </Form>
            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}>
                <img alt='example' style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Drawer>
    );
}
