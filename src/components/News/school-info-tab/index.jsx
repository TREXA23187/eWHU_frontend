import React, { useState } from 'react';
import { Row, Col, Anchor, Button, Tabs } from 'antd';
import SchoolInfoCardList from './card-list';
import SchoolInfoTable from './table';
import SchoolListModal from '../shool-list-modal';
import { t } from 'i18next';
import iconJingguan from '../../../assets/images/school/jingguan.webp';
import iconZihuan from '../../../assets/images/school/zihuan.webp';
import iconTujian from '../../../assets/images/school/tujian.webp';
import iconYaogan from '../../../assets/images/school/yaogan.webp';
import iconLaw from '../../../assets/images/school/law.webp';
import iconMax from '../../../assets/images/school/max.webp';
import NewsInfoModal from '../news-info-modal';

const schoolList = [
    {
        id: 1,
        title: '资源与环境科学学院',
        website: 'http://sres.whu.edu.cn/',
        icon: iconZihuan
    },
    { id: 2, title: '法学院', website: 'https://law.whu.edu.cn/', icon: iconLaw },
    { id: 3, title: '经济与管理学院', website: 'http://ems.whu.edu.cn/', icon: iconJingguan },
    { id: 4, title: '土木建筑工程学院', website: 'http://sres.whu.edu.cn/', icon: iconTujian },
    { id: 5, title: '遥感信息工程学院', website: 'http://rsgis.whu.edu.cn/', icon: iconYaogan },
    { id: 6, title: '马克思主义学院', website: 'http://www.marx.whu.edu.cn/', icon: iconMax }
];

const { Link } = Anchor;
const { TabPane } = Tabs;

export default function SchoolInfoTab(props) {
    const { isPreview, data, onUpdate } = props;
    const [visible, setVisible] = useState(false);
    const [activeKey, setActiveKey] = useState(schoolList[0].title);
    const [infoVisible, setInfoVisible] = useState(false);
    const [infoData, setInfoData] = useState({});

    const onModalShow = data => {
        setInfoData(data);
        setInfoVisible(true);
    };

    const schoolData = data?.filter(item => item?.publish_depart === activeKey);

    return (
        <div>
            <Row gutter={32}>
                <Col span={6}>
                    <div style={{ position: 'fixed' }}>
                        <Button style={{ marginBottom: 15 }} type='primary' onClick={() => setVisible(true)}>
                            {t('学院管理')}
                        </Button>
                        {/* <Anchor affix={false} onClick={handleClick}>
                            {schoolList.map(item => (
                                <Link href={`#${item.title}`} title={item.title} key={item.id} />
                            ))}
                        </Anchor> */}
                        <Tabs
                            defaultActiveKey={schoolList[0].title}
                            tabPosition='left'
                            style={{ maxHeight: 400 }}
                            activeKey={activeKey}
                            onChange={setActiveKey}>
                            {schoolList.map(item => (
                                <TabPane tab={item.title} key={item.title}>
                                    {null}
                                </TabPane>
                            ))}
                        </Tabs>
                    </div>
                </Col>
                <Col span={18}>
                    {isPreview ? (
                        <SchoolInfoCardList data={schoolData} onUpdate={onUpdate} onModalShow={onModalShow} />
                    ) : (
                        <SchoolInfoTable data={schoolData} onUpdate={onUpdate} onModalShow={onModalShow} />
                    )}
                </Col>
            </Row>
            <SchoolListModal visible={visible} schoolList={schoolList} onCancel={() => setVisible(false)} />
            <NewsInfoModal
                visible={infoVisible}
                data={infoData}
                currentTab='school'
                onCancel={() => setInfoVisible(false)}
            />
        </div>
    );
}
