import React, { useState, useRef } from 'react';
import { Layout, Divider, Table, Input, Button, Space, message } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/hooks';
import { getUserList, deleteUser } from '@/api/user';
import AddUserModel from '@/components/User/add-user-modal';
import { ls } from '@/utils/storage';

const onClick = ({ key }) => {};

export default function User() {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const [visible, setVisible] = useState(false);
    const [userData, setUserData] = useState({});
    const [modalType, setModalType] = useState('add'); // add || edit

    const inputRef = useRef(null);

    const { data: userList, refresh, run } = useRequest(async () => {
        const res = await getUserList();

        return res.data.sort((a, b) => b.role - a.role);
    });

    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={inputRef}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type='primary'
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size='small'
                        style={{ width: 90 }}>
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type='link'
                        size='small'
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}>
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => inputRef.current.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            )
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = clearFilters => {
        clearFilters();
        setSearchText('');
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            ...getColumnSearchProps('usernamename')
        },
        {
            title: '学号/工号',
            dataIndex: 'school_id',
            key: 'school_id',
            ...getColumnSearchProps('school_id')
        },
        {
            title: '手机号',
            dataIndex: 'phone_number',
            key: 'phone_number',
            ...getColumnSearchProps('phone_number'),
            render(value) {
                return value || '-';
            }
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
            render(value) {
                return value || '-';
            }
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            ...getColumnSearchProps('role'),
            render(value) {
                const roles = {
                    0: '普通用户',
                    1: '管理员',
                    2: '超级管理员'
                };
                return roles[value];
            }
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            ...getColumnSearchProps('remark'),
            render(value) {
                return value || '-';
            }
        },
        {
            title: '操作',
            render(rol) {
                const disabled = ls.get('user').role <= rol.role ? true : false;
                return (
                    <div>
                        <Button
                            type='text'
                            style={{ color: disabled ? '' : 'blue' }}
                            onClick={() => {
                                setUserData(rol);
                                setModalType('edit');
                                setVisible(true);
                            }}
                            disabled={disabled}>
                            编辑
                        </Button>
                        <Button
                            type='text'
                            danger
                            onClick={async () => {
                                const res = await deleteUser(rol.id);
                                message.success(res.message);
                                refresh();
                            }}
                            disabled={disabled}>
                            删除
                        </Button>
                    </div>
                );
            }
        }
    ];
    return (
        <Layout className='animated fadeIn'>
            <div className='base-style'>
                {/* <h3>用户管理</h3> */}
                <Space style={{ marginBottom: 16 }}>
                    <Button
                        onClick={() => {
                            setVisible(true);
                            setModalType('add');
                            setUserData({});
                        }}>
                        <UserAddOutlined />
                        添加用户
                    </Button>
                </Space>
                <Table columns={columns} dataSource={userList} rowKey='id' />
            </div>
            <AddUserModel
                data={userData}
                visible={visible}
                type={modalType}
                type={modalType}
                onCancel={() => {
                    setVisible(false);
                    refresh();
                }}
            />
        </Layout>
    );
}
