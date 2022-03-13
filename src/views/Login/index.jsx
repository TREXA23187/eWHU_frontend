import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Input, Form, Button, Divider, message, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { ls } from '@/utils/storage';
import { encrypt } from '@/utils/crypt';
import { login } from '@/api/user';
import '@/style/view-style/login.less';

const Login = props => {
    const [loading, setLoading] = useState(false);

    const handleSubmitFinish = async values => {
        setLoading(true);
        let { username, password } = values;
        const key = '751f621ea5c8f930';
        const iv = '2624750004598718';
        const res = await login({ username, password: encrypt(password, key, iv) });

        if (res.code === 0) {
            ls.set('user', res.data.user_info);
            setLoading(false);
            message.success('登录成功!');
            setTimeout(() => {
                props.history.push('/');
            }, 1000);
        } else {
            setLoading(false);
            message.success(res.message);
        }
    };

    useEffect(() => {
        notification.open({
            message: '欢迎使用e武大管理平台',
            duration: null
            // description: '账号 admin(管理员) 其他(游客) 密码随意'
        });
        return () => {
            notification.destroy();
        };
    }, []);

    return (
        <Layout className='login animated fadeIn'>
            <div className='model'>
                <div className='login-form'>
                    <h3>后台管理系统</h3>
                    <Divider />
                    <Form onFinish={handleSubmitFinish}>
                        <Form.Item
                            // label="Username"
                            name='username'
                            rules={[{ required: true, message: '请输入用户名' }]}>
                            <Input placeholder='用户名' prefix={<UserOutlined className='site-form-item-icon' />} />
                        </Form.Item>
                        <Form.Item
                            // label="Password"
                            name='password'
                            rules={[{ required: true, message: '请输入密码' }]}>
                            <Input.Password
                                type='password'
                                placeholder='密码'
                                prefix={<LockOutlined className='site-form-item-icon' />}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type='primary' htmlType='submit' className='login-form-button' loading={loading}>
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Layout>
    );
};

export default withRouter(Login);
