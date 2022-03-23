import React, { useState, useRef } from 'react';
import { Layout, Button, Row, Col, List, Card, Empty, Input, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
import AppInfoDrawer from '@/components/Application/app-info-drawer';
import { useRequest } from '@umijs/hooks';
import { addAppGroup, getAppGroup, getApplication } from '@/api/app';

export default function ApplicationView() {
    const { t } = useTranslation();
    const [editAdd, setEditAdd] = useState(false);
    const [newGroup, setNewGroup] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [appInfo, setAppInfo] = useState({});
    const [drawerType, setDrawerType] = useState('view');

    const addInputRef = useRef(null);

    const formatAppList = (groups, apps) => {
        if (groups && apps) {
            const listMap = {};
            const groupList = [];
            for (let item of groups) {
                listMap[item.id] = { ...item, apps: [] };
            }
            for (let item of apps) {
                listMap[item.group_id].apps.push(item);
            }
            for (let key in listMap) {
                groupList.push(listMap[key]);
            }

            return groupList.sort((a, b) => a.id - b.id);
        }
    };

    const { data: appGroup, run: updateAppGroup } = useRequest(async () => {
        const res = await getAppGroup({});
        return res.data;
    });

    const { data: appList, run: updateAppList } = useRequest(async () => {
        const res = await getApplication({});
        return res.data;
    });

    const gridStyle = {
        width: '33.333%',
        textAlign: 'center',
        cursor: 'pointer',
        height: 75
    };

    const handleAddGroup = e => {
        const clearData = () => {
            setEditAdd(false);
            setNewGroup('');
            setModalVisible(false);
        };

        if (e.keyCode === 13 || (!e.keyCode && !modalVisible)) {
            if (newGroup) {
                setModalVisible(true);
                Modal.confirm({
                    title: `是否确认添加应用分组——${newGroup}`,
                    icon: <ExclamationCircleOutlined />,
                    async onOk() {
                        const res = await addAppGroup({ name_zh: newGroup, name_en: '' });
                        if (res.code === 0) {
                            updateAppGroup();
                            clearData();
                        }
                    },
                    onCancel() {
                        clearData();
                    }
                });
            } else {
                clearData();
            }
        }
    };

    return (
        <Layout>
            <div className='base-style' style={{ height: 660, overflow: 'scroll' }}>
                {/* <div style={{ backgroundColor: 'red', marginBottom: 20 }}>
                    <Button>{t('添加应用')}</Button>
                </div> */}
                <div style={{ width: '84%', marginLeft: '9%' }}>
                    {appGroup &&
                        appList &&
                        formatAppList(appGroup, appList).map(item => (
                            <Card
                                title={
                                    <div>
                                        {item.name_zh}
                                        <EditOutlined
                                            style={{ marginLeft: 5 }}
                                            onClick={() => {
                                                console.log('click');
                                            }}
                                        />
                                    </div>
                                }
                                style={{ marginBottom: 20 }}
                                key={item.id}>
                                {item.apps.map(app => (
                                    <Card.Grid
                                        style={gridStyle}
                                        key={app.id}
                                        onClick={() => {
                                            setDrawerVisible(true);
                                            setDrawerType('view');
                                            setAppInfo(app);
                                        }}>
                                        {app.name_en ? `${app.name_zh}(${app.name_en})` : app.name_zh}
                                    </Card.Grid>
                                ))}
                                <Card.Grid
                                    style={gridStyle}
                                    onClick={() => {
                                        setDrawerType('add');
                                        setDrawerVisible(true);
                                        setAppInfo({});
                                    }}>
                                    <PlusOutlined style={{ fontSize: 23, color: '#bbcdc5' }} />
                                </Card.Grid>
                            </Card>
                        ))}
                    <Card
                        title={
                            editAdd ? (
                                <Input
                                    bordered={false}
                                    ref={addInputRef}
                                    value={newGroup}
                                    onChange={e => setNewGroup(e.target.value)}
                                    onBlur={handleAddGroup}
                                    onKeyDown={handleAddGroup}
                                />
                            ) : (
                                <div style={{ color: '#bbcdc5' }}>
                                    <PlusOutlined style={{ marginRight: 5 }} />
                                    {t('添加分组')}
                                </div>
                            )
                        }
                        style={{ marginBottom: 20 }}
                        bodyStyle={{ display: 'none' }}
                        hoverable={true}
                        onClick={() => {
                            setEditAdd(true);
                            setTimeout(() => addInputRef.current.focus(), 100);
                        }}></Card>
                </div>
            </div>
            <AppInfoDrawer
                type={drawerType}
                visible={drawerVisible}
                groupData={appGroup}
                data={appInfo}
                onUpdate={() => {
                    setDrawerVisible(false);
                    updateAppList({});
                }}
                onClose={() => {
                    setDrawerVisible(false);
                    setAppInfo({});
                }}
                onTypeChange={setDrawerType}
            />
        </Layout>
    );
}
