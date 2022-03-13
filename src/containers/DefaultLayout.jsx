import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, withRouter, Link, useHistory } from 'react-router-dom';
import routes from '@/routes';
import { Layout, BackTop, message, Tabs, Menu } from 'antd';
import '@/style/layout.less';

import AppHeader from './AppHeader.jsx';
import AppAside from './AppAside.jsx';
import AppFooter from './AppFooter.jsx';
import menus from '@/routes/menus';
import avatar from '@/assets/images/user.png';

import { ss, ls } from '@/utils/storage.js';

const { Content } = Layout;
const { TabPane } = Tabs;

const getMenu = menu => {
    const auth = ls.get('user')?.role || 0;
    const newMenu = menu.filter(res => !res.auth || res.auth.indexOf(auth) !== -1);

    return newMenu;
};

export default function DefaultLayout(props) {
    useEffect(() => {
        ss.set('tabList', [{ title: '首页', content: '', key: '/index', closable: false }]);
    }, []);

    const [menu] = useState(prevState => {
        if (!localStorage.getItem('user')) {
            props.history.push('/login');
            return [];
        } else {
            return getMenu(menus);
        }
    });

    let auth = ls.get('user')?.role || 0;

    const [menuToggle, setMenuToggle] = useState(false);
    const [panes, setPanes] = useState(
        ss.get('tabList', [{ title: '首页', content: '', key: '/index', closable: false }])
    );
    const [activeKey, setActiveKey] = useState(panes[0].key);

    const history = useHistory();

    const menuClick = () => {
        setMenuToggle(!menuToggle);
    };

    const loginOut = () => {
        localStorage.clear();
        props.history.push('/login');
        message.success('登出成功!');
    };

    const remove = (targetKey, action) => {
        let newActiveKey = activeKey;
        let lastIndex;
        panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const newPanes = panes.filter(pane => pane.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        if (newPanes.length === 1) {
            newPanes[0].closable = false;
        }
        setPanes(newPanes);
        ss.set('tabList', newPanes);
        setActiveKey(newActiveKey);
        history.replace(newPanes[0]?.key || '/index');
    };

    const renderTabPaneItem = ({ key, title, closable }) => {
        return <TabPane tab={title} key={key} closable={closable} />;
    };

    const updateTabs = (key, panes) => {
        setActiveKey(key);
        setPanes(panes);
    };

    return (
        <Layout className='app'>
            <BackTop />
            <AppAside menuToggle={menuToggle} menu={menu} updateTabs={updateTabs} />
            <Layout style={{ minHeight: '100vh' }}>
                <AppHeader menuToggle={menuToggle} menuClick={menuClick} avatar={avatar} loginOut={loginOut} />
                <Content className='content'>
                    <Tabs
                        hideAdd
                        type='editable-card'
                        onChange={key => {
                            setActiveKey(key);
                            history.replace(key);
                        }}
                        activeKey={activeKey}
                        onEdit={remove}
                        style={{ marginBottom: -17 }}>
                        {panes?.map(pane => (
                            <TabPane tab={pane.title} key={pane.key} closable={pane.closable} />
                        ))}
                    </Tabs>
                    <Switch>
                        {routes.map(item => {
                            return (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    exact={item.exact}
                                    render={props =>
                                        !item.auth || item.auth.indexOf(auth) !== -1 ? (
                                            <item.component />
                                        ) : (
                                            <Redirect to='/404' {...props} />
                                        )
                                    }></Route>
                            );
                        })}

                        <Redirect to='/404' />
                    </Switch>
                </Content>
                <AppFooter />
            </Layout>
        </Layout>
    );
}
