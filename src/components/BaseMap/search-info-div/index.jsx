import React, { useState } from 'react';
import { Cascader, Tabs, Form, Input, Button, Space, List, Select } from 'antd';
import { EnvironmentOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import MarkerOrange from '@/assets/images/marker-orange.png';
import { t } from 'i18next';
import L from 'leaflet';
import { queryPOIByCode, queryByBuffer, measureDistance } from '@/utils/map';
import { getLocationInfo } from '@/api/utils';

const { Option } = Select;

const options = [
    {
        label: '校园办公',
        value: ['101', '102', '103'],
        children: [
            {
                label: '校园出入',
                value: '101'
            },
            {
                label: '学部信息',
                value: '102'
            },
            {
                label: '学院办公',
                value: '103'
            }
        ]
    },
    {
        label: '交通站点',
        value: ['201', '202', '203'],
        children: [
            {
                label: '交通路口',
                value: '201'
            },
            {
                label: '公交站点',
                value: '202'
            },
            {
                label: '地铁站点',
                value: '203'
            }
        ]
    },
    {
        label: '旅游项目',
        value: ['301', '302', '303'],
        children: [
            {
                label: '酒店旅馆',
                value: '301'
            },
            {
                label: '自然风光',
                value: '302'
            },
            {
                label: '石碑雕像',
                value: '303'
            }
        ]
    },
    {
        label: '便利设施',
        value: [
            '401',
            '402',
            '403',
            '404',
            '405',
            '406',
            '407',
            '408',
            '409',
            '410',
            '411',
            '412',
            '413',
            '414',
            '415',
            '416'
        ],
        children: [
            {
                label: '酒楼饭店',
                value: '401'
            },
            {
                label: '银行ATM',
                value: '402'
            },
            {
                label: '诊所医院',
                value: '403'
            },
            {
                label: '休闲茶馆',
                value: '404'
            },
            {
                label: '简食快餐',
                value: '405'
            },
            {
                label: '停车场地',
                value: '406'
            },
            {
                label: '街道办事',
                value: '407'
            },
            {
                label: '加油站点',
                value: '408'
            },
            {
                label: '警察机关',
                value: '409'
            },
            {
                label: '教育场所',
                value: '410'
            },
            {
                label: '邮政快递',
                value: '411'
            },
            {
                label: '共享单车',
                value: '412'
            },
            {
                label: '剧院影院',
                value: '413'
            },
            {
                label: '运动场馆',
                value: '414'
            },
            {
                label: '垃圾回收',
                value: '415'
            },
            {
                label: 'K歌娱乐',
                value: '416'
            }
        ]
    },
    {
        label: '超市商店',
        value: ['501', '502', '503', '504', '505', '506', '507'],
        children: [
            {
                label: '超市百货',
                value: '501'
            },
            {
                label: '便利商店',
                value: '502'
            },
            {
                label: '书管书店',
                value: '503'
            },
            {
                label: '面包烘焙',
                value: '504'
            },
            {
                label: '洗衣干洗',
                value: '505'
            },
            {
                label: '理发沙龙',
                value: '506'
            },
            {
                label: '广告复印',
                value: '507'
            }
        ]
    }
];

export default function SearchInfoDiv(props) {
    const { map, onClear, onChangeCursor } = props;

    const [searchValue, setSearchValue] = useState([]);
    const [searchResult, setSearchResult] = useState([]);

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();

    const onSearch = async () => {
        onClear();
        setLoading(true);

        if (showAdvanced && form.getFieldValue('factors')) {
            const center = form.getFieldValue('factors').filter(item => item.factor_name === 'buffer_center')?.[0]
                ?.factor_value;
            const radius =
                form.getFieldValue('factors').filter(item => item.factor_name === 'buffer_radius')?.[0]?.factor_value ||
                0.5;
            const [startLat, startLon] = center.split(',');
            const centerPoint = L.circle([startLat, startLon]);

            searchValue.forEach(async item => {
                const res = await queryByBuffer(map, centerPoint, radius, item);
                const resList = [];
                for (let feature of res.features) {
                    const [lon, lat] = feature.geometry.coordinates;
                    const { result } = await getLocationInfo(`${lat},${lon}`);
                    const { distance } = await measureDistance([startLat, startLon], [lat, lon]);

                    resList.push({
                        id: feature.id,
                        location: [lat, lon],
                        name: feature.properties.name,
                        code: feature.properties.code,
                        address: result.formatted_address,
                        distance: parseInt(distance)
                    });
                }
                setSearchResult(resList.sort((a, b) => a.distance - b.distance));
            });
        } else {
            searchValue.forEach(async item => {
                const res = await queryPOIByCode(map, item);
                const resList = [];
                for (let feature of res.features) {
                    const [lon, lat] = feature.geometry.coordinates;
                    const { result } = await getLocationInfo(`${lat},${lon}`);
                    resList.push({
                        id: feature.id,
                        location: [lat, lon],
                        name: feature.properties.NAME,
                        code: feature.properties.CODE,
                        address: result.formatted_address
                    });
                }
                setSearchResult(resList);
            });
        }
        setTimeout(() => setLoading(false), 500);
    };

    const onChange = value => {
        let valueList = [];
        value.forEach(item => {
            if (item[1]) {
                valueList.push(item[1]);
            } else {
                valueList = [...valueList, ...item[0]];
            }
        });
        setSearchValue(valueList);
    };

    const setBufferCenter = key => {
        onChangeCursor('pointer');
        map.on('click', e => {
            const { lat, lng } = e.latlng;
            L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: MarkerOrange,
                    iconSize: [25, 41],
                    iconAnchor: [13, 41],
                    popupAnchor: [0, -20]
                })
            })
                .bindPopup('缓冲区中心')
                .addTo(map);

            const newData = form.getFieldValue('factors');
            newData[key] = {
                ...newData[key],
                factor_name: 'buffer_center',
                factor_value: `${lat},${lng}`
            };
            form.setFieldsValue({
                factors: newData
            });
            onChangeCursor('');
            map.off('click');
        });
    };

    return (
        <div
            className='base-style'
            style={{
                position: 'absolute',
                overflow: 'scroll',
                zIndex: 99,
                width: 360,
                height: 550,
                right: 10,
                top: 50
            }}>
            <Cascader
                style={{ width: '100%' }}
                options={options}
                onChange={onChange}
                dropdownMenuColumnStyle={{ width: 150 }}
                placeholder='选择查询目标类型'
                multiple
                maxTagCount='responsive'
            />
            <Button onClick={onSearch} style={{ margin: '10px 0' }} disabled={!searchValue.length}>
                查询
            </Button>
            {Boolean(searchValue.length) && (
                <Button type='link' size='small' onClick={() => setShowAdvanced(!showAdvanced)}>
                    高级条件
                </Button>
            )}
            {showAdvanced && (
                <Form form={form} autoComplete='off'>
                    <Form.List name='factors'>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: -15 }} align='baseline'>
                                        <Form.Item {...restField} name={[name, 'factor_name']}>
                                            <Select style={{ width: 120 }}>
                                                <Option value='buffer_center'>缓冲区中心</Option>
                                                <Option value='buffer_radius'>缓冲区半径</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'factor_value']}>
                                            <Input
                                                prefix={<EnvironmentOutlined onClick={() => setBufferCenter(key)} />}
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                {fields.length < 2 && (
                                    <Form.Item>
                                        <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加条件
                                        </Button>
                                    </Form.Item>
                                )}
                            </>
                        )}
                    </Form.List>
                </Form>
            )}
            <div style={{ maxHeight: showAdvanced ? 330 : 400, overflow: 'scroll' }}>
                <List
                    itemLayout='horizontal'
                    dataSource={searchResult}
                    loading={loading}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={<a>{item.distance ? `${item.name} (距离: ${item.distance}米)` : item.name}</a>}
                                description={item.address}
                            />
                            <div style={{ width: 50, marginRight: 10 }}>
                                <Button
                                    type='link'
                                    size='small'
                                    onClick={() => {
                                        map.setView(item.location, 16);
                                    }}>
                                    <>
                                        <EnvironmentOutlined style={{ marginRight: 10 }} />
                                        <span>定位</span>
                                    </>
                                </Button>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
}
