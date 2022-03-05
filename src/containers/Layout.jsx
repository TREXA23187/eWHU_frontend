import React, { useState, useEffect } from 'react'
import { Route, Switch, Redirect, withRouter, Link, useHistory } from 'react-router-dom'
import routes from '@/routes'
import { Layout, BackTop, message, Tabs, Menu } from 'antd'

import AppHeader from './AppHeader.jsx'
import AppAside from './AppAside.jsx'
import AppFooter from './AppFooter.jsx'
import menus from '@/routes/menus'
import avatar from '@/assets/images/user.png'

import { ss, ls } from '@/utils/storage.js'

const { Content } = Layout
const { TabPane } = Tabs

const getMenu = menu => {
    let newMenu,
        auth = ls.get('user').auth
    if (!auth) {
        return menu
    } else {
        newMenu = menu.filter(res => res.auth && res.auth.indexOf(auth) !== -1)
        return newMenu
    }
}

const DefaultLayout = props => {
    useEffect(() => {
        ss.set('tabList', [{ title: '首页', content: '', key: '/index', closable: false }])
    }, [])

    const [menu] = useState(prevState => {
        if (!localStorage.getItem('user')) {
            props.history.push('/login')
            return []
        } else {
            return getMenu(menus)
        }
    })

    let auth = ls.get('user')?.auth || ''
    console.log(auth)

    const [menuToggle, setMenuToggle] = useState(false)
    const [panes, setPanes] = useState(
        ss.get('tabList', [{ title: '首页', content: '', key: '/index', closable: false }])
    )
    const [activeKey, setActiveKey] = useState(panes[0].key)

    const history = useHistory()

    const menuClick = () => {
        setMenuToggle(!menuToggle)
    }

    const loginOut = () => {
        localStorage.clear()
        props.history.push('/login')
        message.success('登出成功!')
    }

    const remove = (targetKey, action) => {
        let newActiveKey = activeKey
        let lastIndex
        panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1
            }
        })
        const newPanes = panes.filter(pane => pane.key !== targetKey)
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key
            } else {
                newActiveKey = newPanes[0].key
            }
        }
        if (newPanes.length === 1) {
            newPanes[0].closable = false
        }
        setPanes(newPanes)
        ss.set('tabList', newPanes)
        setActiveKey(newActiveKey)
        history.replace(newPanes[0]?.key || '/index')
    }

    const renderTabPaneItem = ({ key, title, closable }) => (
        <TabPane
            tab={
                <Link to={key} replace>
                    <span>{title}</span>
                </Link>
            }
            key={key}
            closable={closable}
        />
    )

    return (
        <Layout className='app'>
            <BackTop />
            <AppAside menuToggle={menuToggle} menu={menu} updateTabs={setPanes} />
            <Layout style={{ minHeight: '100vh' }}>
                <AppHeader menuToggle={menuToggle} menuClick={menuClick} avatar={avatar} loginOut={loginOut} />
                <Content className='content'>
                    <Tabs
                        hideAdd
                        type='editable-card'
                        onChange={setActiveKey}
                        activeKey={activeKey}
                        onEdit={remove}
                        style={{ marginBottom: -17 }}>
                        {panes?.map(pane =>
                            renderTabPaneItem({ key: pane.key, title: pane.title, closable: pane.closable })
                        )}
                    </Tabs>
                    <Switch>
                        {routes.map(item => {
                            return (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    exact={item.exact}
                                    render={props =>
                                        !auth ? (
                                            <item.component />
                                        ) : item.auth && item.auth.indexOf(auth) !== -1 ? (
                                            <item.component />
                                        ) : (
                                            // 这里也可以跳转到 403 页面
                                            <Redirect to='/404' {...props} />
                                        )
                                    }></Route>
                            )
                        })}

                        <Redirect to='/404' />
                    </Switch>
                </Content>
                <AppFooter />
            </Layout>
        </Layout>
    )
}
export default DefaultLayout
