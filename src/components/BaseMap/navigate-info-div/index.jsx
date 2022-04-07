import React, { useState, useEffect } from 'react';
import { List, Tabs, Button, Input } from 'antd';
import {
    EnvironmentOutlined,
    VerticalAlignTopOutlined,
    ToTopOutlined,
    SwapOutlined,
    SwapRightOutlined,
    BranchesOutlined,
    FieldTimeOutlined
} from '@ant-design/icons';
import { t } from 'i18next';
import L from 'leaflet';
import { query, measureDistance } from '@/utils/map';
import MarkerOrange from '@/assets/images/marker-orange.png';
import MarkerGreen from '@/assets/images/marker-green.png';

const { Search } = Input;
const { TabPane } = Tabs;

export default function NavigateInfoDiv(props) {
    const { map, data, visible, pointInfo, pathInfo, onFindPath, onShow } = props;
    const [searchValue, setSearchValue] = useState('');
    const [startPoint, setStartPoint] = useState(pointInfo[0] || {});
    const [endPoint, setEndPoint] = useState(pointInfo[1] || {});
    const [isStart, setIsStart] = useState(true);

    const [showRoute, setShowRoute] = useState(false);

    useEffect(() => {
        if (startPoint.name) {
            setIsStart(false);
        } else {
            setIsStart(true);
        }
    }, [startPoint]);

    const onSearch = async value => {
        const res = await query(map, value);
        const locationList = [];
        for (let item of res.features) {
            const [lon, lat] = item.geometry.coordinates;
            const result = {
                id: item.id,
                name: item.properties.NAME,
                location: `${lat},${lon}`
            };
            if (startPoint.location) {
                const { distance } = await measureDistance(startPoint.location, [lat, lon]);
                result.distance = parseInt(distance);
            }

            locationList.push(result);
        }

        onShow(startPoint.location ? locationList.sort((a, b) => a.distance - b.distance) : locationList);
    };

    const findPath = () => {
        const start = L.latLng(startPoint.location);
        const end = L.latLng(endPoint.location);
        const pathNodes = [start, end];
        map.setZoom(15);
        onFindPath(pathNodes);
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
                top: 50,
                display: visible ? 'inline-block' : 'none'
            }}>
            <Search
                placeholder='搜索目的地'
                allowClear
                enterButton='搜索'
                size='middle'
                onSearch={onSearch}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
                <Input
                    style={{ width: 140 }}
                    value={startPoint.name || ''}
                    allowClear
                    onChange={() => setStartPoint({})}
                />
                <SwapOutlined style={{ margin: '0 10px' }} />
                <Input style={{ width: 140 }} value={endPoint.name || ''} allowClear onChange={() => setEndPoint({})} />
            </div>
            <div style={{ maxHeight: 370, overflow: 'scroll', marginTop: 10 }}>
                {!pathInfo?.distance?.info?.length ? (
                    <List
                        itemLayout='horizontal'
                        dataSource={data}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <a>{item.distance ? `${item.name} (距离: ${item.distance}米)` : item.name}</a>
                                    }
                                    description={item.address}
                                />
                                <div style={{ width: 50, marginRight: 10 }}>
                                    <Button
                                        type='link'
                                        size='small'
                                        onClick={() => {
                                            const [lat, lon] = item.location.split(',');
                                            map.setView([lat, lon], 16);
                                        }}>
                                        <>
                                            <EnvironmentOutlined style={{ marginRight: 10 }} />
                                            <span>定位</span>
                                        </>
                                    </Button>
                                    {isStart ? (
                                        <Button
                                            type='link'
                                            size='small'
                                            onClick={() => {
                                                const [lat, lon] = item.location.split(',');
                                                map.setView([lat, lon], 16);
                                                setStartPoint({ name: item.name, location: [lat, lon] });
                                                L.marker([lat, lon], {
                                                    icon: L.icon({
                                                        iconUrl: MarkerGreen,
                                                        iconSize: [25, 41],
                                                        iconAnchor: [13, 41],
                                                        popupAnchor: [0, -20]
                                                    })
                                                })
                                                    .bindPopup(`起点: ${item.name}`)
                                                    .addTo(map);
                                            }}>
                                            <>
                                                <ToTopOutlined style={{ marginRight: 10 }} />
                                                <span>起点</span>
                                            </>
                                        </Button>
                                    ) : (
                                        <Button
                                            type='link'
                                            size='small'
                                            onClick={() => {
                                                const [lat, lon] = item.location.split(',');
                                                map.setView([lat, lon], 16);
                                                setEndPoint({ name: item.name, location: [lat, lon] });
                                                L.marker([lat, lon], {
                                                    icon: L.icon({
                                                        iconUrl: MarkerOrange,
                                                        iconSize: [25, 41],
                                                        iconAnchor: [13, 41],
                                                        popupAnchor: [0, -20]
                                                    })
                                                })
                                                    .bindPopup(`终点: ${item.name}`)
                                                    .addTo(map);
                                            }}>
                                            <>
                                                <VerticalAlignTopOutlined style={{ marginRight: 10 }} />
                                                <span>终点</span>
                                            </>
                                        </Button>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Tabs defaultActiveKey='distance' centered>
                        <TabPane
                            tab={
                                <span style={{ color: 'red' }}>
                                    <BranchesOutlined />
                                    距离最短
                                </span>
                            }
                            key='distance'>
                            <div>共计{parseInt(pathInfo?.distance?.weight)}米</div>
                            <List
                                size='small'
                                header={
                                    <div>
                                        <div>
                                            {pointInfo[0] || startPoint.name}
                                            <SwapRightOutlined style={{ margin: '0 10px' }} />
                                        </div>
                                        {pointInfo[1] || endPoint.name}
                                    </div>
                                }
                                bordered
                                dataSource={pathInfo?.distance?.info}
                                renderItem={item => <List.Item style={{ height: 25 }}>{item}</List.Item>}
                            />
                        </TabPane>
                        <TabPane
                            tab={
                                <span style={{ color: 'blue' }}>
                                    <FieldTimeOutlined />
                                    时间最短
                                </span>
                            }
                            key='time'>
                            {/* <div>共计{parseInt((1 / parseInt(pathInfo?.speed?.weight)) * 30 * 30)}分钟</div> */}
                            <div>共计{parseInt(pathInfo?.distance?.weight / pathInfo?.speed?.weight)}分钟</div>
                            <List
                                size='small'
                                header={
                                    <div>
                                        <div>
                                            {pointInfo[0] || startPoint.name}
                                            <SwapRightOutlined style={{ margin: '0 10px' }} />
                                        </div>
                                        {pointInfo[1] || endPoint.name}
                                    </div>
                                }
                                bordered
                                dataSource={pathInfo?.speed?.info}
                                renderItem={item => <List.Item style={{ height: 25 }}>{item}</List.Item>}
                            />
                        </TabPane>
                    </Tabs>
                )}
            </div>
            <Button onClick={findPath} disabled={!startPoint.name || !endPoint.name}>
                路径规划
            </Button>
        </div>
    );
}
