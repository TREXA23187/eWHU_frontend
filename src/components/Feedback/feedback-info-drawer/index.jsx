import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, Upload, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { addFeedback } from '@/api/feedback';
import { ls } from '@/utils/storage';

export default function FeedbackInfoDrawer(props) {
    const { data, visible, onClose, onUpdate } = props;
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [initValues, setInitValues] = useState({ type: 'logistics', info_picture: [], remark: '', ...data });

    const [fileList, setFileList] = useState(data?.info_picture || []);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const userInfo = ls.get('user');

    const problemType = {
        logistics: t('后勤报修'),
        network: t('网络报修'),
        suggestion: t('优化建议'),
        other: t('其他')
    };

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    useEffect(() => {
        setInitValues({ type: 'logistics', info_picture: [], remark: '', ...data });
    }, [visible]);

    const handlePreview = async file => {
        setPreviewImage(file.thumbUrl);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    return (
        <Drawer title={t('反馈信息')} visible={visible} destroyOnClose footer={null} onClose={onClose} width='500'>
            <Form {...layout} autoComplete='off'>
                <Form.Item label={t('反馈地址')}>
                    <span>{data.address}</span>
                </Form.Item>
                <Form.Item label={t('反馈类型')}>
                    <span>{problemType[data.type]}</span>
                </Form.Item>
                <Form.Item label={t('详细信息')}>
                    <span>{data.info_detail}</span>
                </Form.Item>
                {Boolean(data.info_picture?.length) && (
                    <Form.Item label={t('反馈图片')}>
                        <Upload
                            action='/api/feedback/img'
                            listType='picture-card'
                            disabled
                            fileList={data.info_picture}
                            onPreview={handlePreview}
                            onChange={handleChange}></Upload>
                    </Form.Item>
                )}
                <Form.Item label={t('备注')}>
                    <div>{data.remark}</div>
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
