import React from 'react';
import { Card, Image, Row, Col, Anchor } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Link } = Anchor;

export default function SchoolInfoCardList(props) {
    const { data } = props;

    return (
        <div>
            <Row gutter={32}>
                {data.map(item => (
                    <Col span={8} style={{ marginBottom: 20 }} key={item.id}>
                        <Card
                            style={{ width: 300 }}
                            cover={<Image width={300} src={item.background_picture[0].thumbUrl} />}
                            actions={[
                                <SettingOutlined key='setting' />,
                                <EditOutlined key='edit' />,
                                <EllipsisOutlined key='ellipsis' />
                            ]}>
                            <Meta title={item.title} description={item.desc} />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
