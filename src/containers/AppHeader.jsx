import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Layout, Avatar, Badge } from 'antd';
import {
    BellOutlined,
    EditOutlined,
    GithubOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { changeLocale } from '@/locale/utils';

const { Header } = Layout;

const AppHeader = props => {
    let { menuClick, avatar, menuToggle, loginOut } = props;
    const menu = (
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
        <Header className='header'>
            <div className='left'>
                {menuToggle ? <MenuUnfoldOutlined onClick={menuClick} /> : <MenuFoldOutlined onClick={menuClick} />}
            </div>
            <div className='right'>
                {/* <div className='mr15'>
                    <a rel='noopener noreferrer' href='/' target='_blank'>
                        <GithubOutlined style={{ color: '#000' }} />
                    </a>
                </div>
                <div className='mr15'>
                    <Badge dot={true} offset={[-2, 0]}>
                        <a href='/' style={{ color: '#000' }}>
                            <BellOutlined />
                        </a>
                    </Badge>
                </div> */}
                <div>
                    <Dropdown overlay={menu} overlayStyle={{ width: 1050 }}>
                        <div className='ant-dropdown-link'>
                            <Avatar src={avatar} alt='avatar' style={{ cursor: 'pointer' }} />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </Header>
    );
};

AppHeader.propTypes = {
    menuClick: PropTypes.func,
    avatar: PropTypes.string,
    menuToggle: PropTypes.bool,
    loginOut: PropTypes.func
};

export default AppHeader;
