import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Select, Upload, Drawer, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { addApplication, deleteApplication } from '@/api/app';
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

export default function AppInfoDrawer(props) {
    const { type, data, visible, groupData, onClose, onUpdate, onTypeChange } = props;
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [initialValues, setInitialValues] = useState(data);

    const [fileList, setFileList] = useState(data?.icon || []);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
    };

    useEffect(() => {
        setFileList(data?.icon || []);
    }, [data]);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{t('上传')}</div>
        </div>
    );

    const onSubmit = async () => {
        const data = await form.validateFields();
        const res = await addApplication({ ...data, icon: data.icon?.fileList || [] });
        if (res.code === 0) {
            form.resetFields([]);
            onUpdate();
        }
    };

    const handlePreview = async file => {
        setPreviewImage(file.thumbUrl);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    return (
        <Drawer
            title={type === 'add' ? t('添加应用') : type === 'edit' ? t('编辑应用') : t('应用信息')}
            visible={visible}
            destroyOnClose
            footer={null}
            onClose={onClose}
            width='500'
            extra={
                <>
                    {type === 'view' ? (
                        <>
                            {/* <Button
                                onClick={() => {
                                    onTypeChange('edit');
                                    console.log(123123123, initialValues);
                                }}>
                                {t('编辑')}
                            </Button> */}
                            <Button
                                danger
                                onClick={async () => {
                                    console.log(data.id);
                                    const res = await deleteApplication({ id: data.id });
                                    if (res.code === 0) {
                                        message.success(res.message);
                                        onClose();
                                        onUpdate();
                                        form.resetFields([]);
                                    }
                                }}>
                                {t('删除')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => onTypeChange('view')}>{t('取消')}</Button>
                            <Button style={{ marginLeft: 12 }} type='primary' onClick={onSubmit}>
                                {t('确定')}
                            </Button>
                        </>
                    )}
                </>
            }>
            <Form {...layout} form={form} autoComplete='off' style={{ marginLeft: 30 }} initialValues={initialValues}>
                <Form.Item label={t('应用名称')} name='name_zh' rules={[{ required: true, message: '请输入应用名称' }]}>
                    {type === 'view' ? <span>{data.name_zh}</span> : <Input />}
                </Form.Item>
                <Form.Item label={t('应用名称 (英文)')} name='name_en'>
                    {type === 'view' ? <span>{data.name_en}</span> : <Input />}
                </Form.Item>
                <Form.Item label={t('应用描述')} name='desc_zh' rules={[{ required: true, message: '请输入应用描述' }]}>
                    {type === 'view' ? <span>{data.desc_zh}</span> : <Input />}
                </Form.Item>
                <Form.Item label={t('应用描述 (英文)')} name='desc_en'>
                    {type === 'view' ? <span>{data.desc_en}</span> : <Input />}
                </Form.Item>
                <Form.Item
                    label={t('应用分组')}
                    name='group_id'
                    rules={[{ required: true, message: '请选择应用分组' }]}>
                    {type === 'view' ? (
                        <span>
                            {groupData &&
                                data.group_id &&
                                groupData.filter(item => item.id === data.group_id)[0].name_zh}
                        </span>
                    ) : (
                        <Select style={{ width: 120 }} style={{ width: 100 }}>
                            {groupData.map(item => (
                                <Option value={item.id} key={item.id}>
                                    {item.name_zh}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label={t('应用图标')} name='icon'>
                    <Upload
                        action='/api/feedback/img'
                        listType='picture-card'
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}>
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                <Form.Item label={t('备注')} name='remark'>
                    {type === 'view' ? <span>{data.remark}</span> : <Input />}
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
