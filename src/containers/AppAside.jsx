import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Dropdown, Menu, Avatar, Button } from 'antd';
import {
    GithubOutlined,
    EditOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import SideMenu from '@/components/SideMenu';
import { changeLocale } from '@/locale/utils';
import { ls } from '@/utils/storage';

const { Sider } = Layout;

const userInfo = ls.get('user');

const AppAside = props => {
    let { menuToggle, menu, updateTabs, avatar, loginOut, menuClick } = props;

    const userMenu = (
        <Menu style={{ width: 182 }}>
            <Menu.ItemGroup title='用户设置'>
                <Menu.Divider />
                <Menu.Item>
                    <EditOutlined /> 个人设置
                </Menu.Item>
                <Menu.Item>
                    <SettingOutlined /> 系统设置
                </Menu.Item>
                <Menu.SubMenu
                    title={
                        <span>
                            <SettingOutlined style={{ marginRight: 5 }} />
                            <span>语言设置</span>
                        </span>
                    }>
                    <Menu.Item onClick={() => changeLocale('zh')}>简体中文</Menu.Item>
                    <Menu.Item onClick={() => changeLocale('en')}>English</Menu.Item>
                </Menu.SubMenu>
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.Item>
                <span onClick={loginOut}>
                    <LogoutOutlined /> 退出登录
                </span>
            </Menu.Item>
        </Menu>
    );

    return (
        <Sider className='aside' trigger={null} collapsible collapsed={menuToggle} style={{ position: 'relative' }}>
            <div className='logo'>
                <a rel='noopener noreferrer' href='/'>
                    <GithubOutlined type='github' style={{ fontSize: '3.8rem', color: '#fff' }} />
                </a>
            </div>
            <SideMenu menu={menu} collapsed={menuToggle} updateTabs={updateTabs}></SideMenu>
            <div style={{ width: '100%', height: 50, backgroundColor: '#20242d', position: 'absolute', bottom: 0 }}>
                {!menuToggle && (
                    <Dropdown overlay={userMenu} placement='topLeft' arrow>
                        <div style={{ cursor: 'pointer' }}>
                            <Avatar src={avatar} alt='avatar' style={{ position: 'absolute', left: 10, top: 7 }} />
                            <span style={{ position: 'absolute', left: 50, top: 12 }}>{userInfo.username}</span>
                        </div>
                    </Dropdown>
                )}
                <div style={{ position: 'absolute', right: menuToggle ? 30 : 10, top: 15 }}>
                    {menuToggle ? (
                        <MenuUnfoldOutlined onClick={menuClick} style={{ fontSize: 20 }} />
                    ) : (
                        <MenuFoldOutlined onClick={menuClick} style={{ fontSize: 20 }} />
                    )}
                </div>
            </div>
        </Sider>
    );
};

AppAside.propTypes = {
    menuToggle: PropTypes.bool,
    menu: PropTypes.array.isRequired
};

export default AppAside;
