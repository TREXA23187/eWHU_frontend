import React from 'react';
import { List, Avatar, Modal } from 'antd';
import { t } from 'i18next';

export default function SchoolListModal(props) {
    const { visible, schoolList, onCancel } = props;

    return (
        <Modal title={t('学院管理')} visible={visible} destroyOnClose footer={null} onCancel={onCancel} width={700}>
            <div style={{ width: 650, height: 400, overflow: 'scroll' }}>
                <List
                    itemLayout='horizontal'
                    dataSource={schoolList}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.icon} />}
                                title={item.title}
                                description={
                                    <span>
                                        {t('学院官网')}:
                                        <a href={item.website} style={{ marginLeft: 10 }} target='_blank'>
                                            {item.website}
                                        </a>
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Modal>
    );
}
