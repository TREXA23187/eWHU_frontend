import React, { useState, useEffect } from 'react';
import { Switch, Tabs, Button, Input } from 'antd';
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
import PieEcharts from './echarts-component/pie';
import PictorialBarEcharts from './echarts-component/pictorialBar.jsx';
import LineEcharts from './echarts-component/line.jsx';

const { Search } = Input;
const { TabPane } = Tabs;

export default function NavigateInfoDiv(props) {
    const { map, data, visible, pointInfo, pathInfo, onFindPath, onShow } = props;

    const [pendingSwitch, setPendingSwitch] = useState(true);
    const [resolvedSwitch, setResolvedSwitch] = useState(true);
    const [discardedSwitch, setDiscardedSwitch] = useState(true);

    return (
        <div>
            <div
                className='base-style'
                style={{
                    position: 'absolute',
                    zIndex: 99,
                    width: 120,
                    height: 85,
                    right: 360,
                    top: 50,
                    fontSize: 5
                }}>
                <div>
                    <span style={{ marginLeft: 12 }}>待解决: </span>
                    <Switch size='small' checked={pendingSwitch} onChange={setPendingSwitch} />
                </div>
                <div>
                    <span style={{ marginLeft: 12 }}>已解决: </span>
                    <Switch size='small' checked={resolvedSwitch} onChange={setResolvedSwitch} />
                </div>
                <div>
                    <span>无需解决: </span>
                    <Switch size='small' checked={discardedSwitch} onChange={setDiscardedSwitch} />
                </div>
            </div>
            <div
                className='base-style'
                style={{
                    position: 'absolute',
                    zIndex: 99,
                    width: 360,
                    height: 550,
                    right: 10,
                    top: 50
                }}>
                <PieEcharts data={data} />
                <PictorialBarEcharts data={data} />
                <LineEcharts data={data} />
            </div>
        </div>
    );
}
