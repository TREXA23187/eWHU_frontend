import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import '@supermap/iclient-leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.heat';
import './index.less';
import { SuperMap } from '@supermap/iclient-leaflet';
import { BasemapType } from '@/constants/basemap';
import { useRequest } from '@umijs/hooks';
import { Button, Select, Switch } from 'antd';
import { findPath } from '@/utils/map';
import { BASE_URL } from '@/constants';
import moment from 'moment';
import MarkerOrange from '@/assets/images/marker-orange.png';
import MarkerGreen from '@/assets/images/marker-green.png';
import MarkerGray from '@/assets/images/marker-gray.png';
import { getFeedbackList } from '@/api/feedback';
import SearchDataModel from './search-data-modal';
import { t } from 'i18next';
import { getLocationInfo } from '@/api/utils';
import PieEcharts from './echarts-component/pie';
import PictorialBarEcharts from './echarts-component/pictorialBar.jsx';
import LineEcharts from './echarts-component/line.jsx';
import NavigateInfoDiv from './navigate-info-div';

const Option = Select.Option;

const url = `http://${BASE_URL}:8090/iserver/services/map-whu_map/rest/maps/whu_map`;
const serviceUrl = `http://${BASE_URL}:8090/iserver/services/transportationAnalyst-whu_map/rest/networkanalyst/whu_map_Network@whu_map`; //路径分析url
const bufferUrl = `http://${BASE_URL}:8090/iserver/services/spatialAnalysis-whu_map/restjsr/spatialanalyst`; //缓冲区分析url

const host = window.isLocal ? window.server : 'https://iserver.supermap.io';
const urlQuery = host + '/iserver/services/map-china400/rest/maps/China_4326';
const wsHost = 'wss://' + (window.isLocal ? document.location.hostname + ':8800' : 'iclsvrws.supermap.io');
const urlDataFlow = wsHost + '/iserver/services/dataflowTest/dataflow';

export default function BaseMap(props) {
    const { t } = useTranslation();

    const { data: feedbackList, run, loading } = useRequest(async filter => {
        const res = await getFeedbackList();
        return res.data.feedback_list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    });

    const [viewType, setViewType] = useState('basic');

    const [baseMap, setBaseMap] = useState(null);

    const [tiandituType, setTiandituType] = useState(BasemapType.vec);

    const [pathNodes, setPathNodes] = useState([]);
    const [pathInfo, setPathInfo] = useState({});
    const [layersList, setLayersList] = useState([]);

    const [bufferRoute, setBufferRoute] = useState(null);

    const [pendingSwitch, setPendingSwitch] = useState(true);
    const [resolvedSwitch, setResolvedSwitch] = useState(true);
    const [discardedSwitch, setDiscardedSwitch] = useState(true);

    const [navigateVisible, setNavigateVisible] = useState(false);
    const [navigateData, setNavigateData] = useState([]);
    const [pointInfo, setPointInfo] = useState([]);

    const mapRef = useRef(null);

    useEffect(() => {
        const map = L.map(mapRef.current, {
            center: [30.537945198059086, 114.36169352722168],
            zoom: 14,
            maxZoom: 17,
            minZoom: 12,
            crs: L.CRS.TianDiTu_WGS84,
            attributionControl: false, //隐藏copyright
            invalidateSize: true
        });

        setBaseMap(map);

        const editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);

        const markerLayers = new L.FeatureGroup();
        map.addLayer(markerLayers);

        const feedbackPointLayers = new L.FeatureGroup();
        map.addLayer(feedbackPointLayers);

        const options = {
            position: 'topleft',
            draw: {
                polyline: {},
                polygon: {},
                circle: {},
                rectangle: {},
                marker: {},
                remove: {}
            },
            edit: {
                featureGroup: editableLayers,
                remove: true
            }
        };

        const drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);

        handleMapEvent(drawControl._container, map);
        map.on(L.Draw.Event.CREATED, async function(e) {
            const type = e.layerType;
            const layer = e.layer;

            if (type === 'marker') {
                const { lat, lng } = e.layer._latlng;
                setPathNodes(pre => {
                    layer.bindPopup(`node ${pre.length + 1}`);
                    return [...pre, L.latLng(lat, lng)];
                });
            }
            editableLayers.addLayer(layer);
            const geo = L.Util.transform(e.layer, L.CRS.TianDiTu_WGS84, L.CRS.EPSG4326);

            const param = new SuperMap.QueryByGeometryParameters({
                // queryParams: { name: "bus_route@bus_route" },
                queryParams: { name: 'POI@whu_map' },
                geometry: geo
            });

            L.supermap.queryService(url).queryByGeometry(param, serviceResult => {
                const result = serviceResult.result;
                const features = L.Util.transform(result.recordsets[0].features, L.CRS.EPSG4326, L.CRS.TianDiTu_WGS84);
                L.geoJSON(features, {
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`${feature.properties.name || 'undefined'}`);
                    }
                }).addTo(markerLayers);
            });
        });

        function handleMapEvent(div, map) {
            if (!div || !map) {
                return;
            }
            div.addEventListener('mouseover', function() {
                map.scrollWheelZoom.disable();
                map.doubleClickZoom.disable();
            });
            div.addEventListener('mouseout', function() {
                map.scrollWheelZoom.enable();
                map.doubleClickZoom.enable();
            });
        }

        const tiandituLayer = L.supermap
            .tiandituTileLayer({
                layerType: BasemapType.vec,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map);
        const tiandituLayerImg = L.supermap
            .tiandituTileLayer({
                layerType: BasemapType.img,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map);
        const tiandituLabelLayer = L.supermap
            .tiandituTileLayer({
                layerType: tiandituType,
                isLabel: true,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map);
        const whuLayer = L.supermap.tiledMapLayer(url).addTo(map);

        setLayersList([
            tiandituLayer._leaflet_id,
            tiandituLabelLayer._leaflet_id,
            whuLayer._leaflet_id,
            editableLayers._leaflet_id,
            markerLayers._leaflet_id
        ]);

        const baseMaps = {
            img: tiandituLayerImg,
            vec: tiandituLayer
        };
        const overlayMaps = {
            campas: whuLayer
        };
        // 添加控件
        L.control.scale().addTo(map);
        L.control.layers(baseMaps, overlayMaps).addTo(map);

        // 数据流部分
        // const popup = L.popup({
        //     offset: L.point(0, 0),
        //     autoPan: true
        // })
        // const dataFlowLayer = L.supermap.dataFlowLayer(urlDataFlow, {
        //     style: function(feature) {
        //         return {
        //             fillColor: 'red',
        //             fillOpacity: 1,
        //             radius: 6,
        //             weight: 0
        //         }
        //     }
        //     //geometry:{coordinates:[[[116.381741960923,39.8765100055449],[116.414681699817,39.8765100055449],[116.414681699817,39.8415115329708],[116.381741960923, 39.8415115329708],[116.381741960923,39.8765100055449]]],type:"Polygon"},
        //     //excludeField:["id"]
        // })
        // dataFlowLayer.on('dataupdated', function(result) {
        //     var feature = result.data
        //     popup.setLatLng(L.GeoJSON.coordsToLatLng(feature.geometry.coordinates)).setContent(feature.properties.time)
        //     if (!popup.isOpen()) {
        //         popup.addTo(map)
        //     }
        // })
        // dataFlowLayer.addTo(map)

        // //模拟实时数据  start
        // //查询一个线数据，每两秒将一个点通过dataFlowService广播给iSevrer的dataflow服务
        // query()
        // var timer, featureResult, dataFlowBroadcast

        // function query() {
        //     var param = new SuperMap.QueryBySQLParameters({
        //         queryParams: {
        //             name: 'Main_Road_L@China#1',
        //             attributeFilter: 'SMID = 1755'
        //         }
        //     })
        //     L.supermap.queryService(urlQuery).queryBySQL(param, function(serviceResult) {
        //         featureResult = serviceResult
        //         dataFlowBroadcast = L.supermap.dataFlowService(urlDataFlow).initBroadcast()
        //         dataFlowBroadcast.on('broadcastSocketConnected', function(e) {
        //             // timer = window.setInterval(() => broadcast(), 2000);
        //         })
        //     })
        // }

        // var count = 200

        // function broadcast() {
        //     if (count >= featureResult.result.recordsets[0].features.features[0].geometry.coordinates.length) {
        //         window.clearInterval(timer)
        //         return
        //     }
        //     var point = featureResult.result.recordsets[0].features.features[0].geometry.coordinates[count]
        //     var feature = {
        //         geometry: {
        //             coordinates: [point[0], point[1]],
        //             type: 'Point'
        //         },
        //         type: 'Feature',
        //         properties: {
        //             id: 1,
        //             time: new Date()
        //         }
        //     }
        //     dataFlowBroadcast.broadcast(feature)
        //     count += 3
        // }
        //模拟实时数据  end
    }, []);

    const handleRemove = () => {
        baseMap.eachLayer(layer => {
            const needRemove = !layersList.includes(layer._leaflet_id);
            needRemove && layer.remove();
        });
    };

    const handleFindPath = pathNodes => {
        const findPathService = L.supermap.networkAnalystService(serviceUrl);
        const resultSetting = new SuperMap.TransportationAnalystResultSetting({
            returnEdgeFeatures: true,
            returnEdgeGeometry: true,
            returnEdgeIDs: true,
            returnNodeFeatures: true,
            returnNodeGeometry: true,
            returnNodeIDs: true,
            returnPathGuides: true,
            returnRoutes: true
        });
        const analystParameterLength = new SuperMap.TransportationAnalystParameter({
            resultSetting: resultSetting,
            weightFieldName: 'SmLength'
        });
        const findPathParameterLength = new SuperMap.FindPathParameters({
            isAnalyzeById: false,
            nodes: pathNodes,
            parameter: analystParameterLength
        });

        //进行查找(长度优先)
        findPathService.findPath(findPathParameterLength, serviceResult => {
            const result = serviceResult.result;
            console.log(123123, serviceResult);
            const directionMap = {
                NORTH: '北',
                EAST: '东',
                SOURTH: '南',
                WEST: '西'
            };
            const roadList = [];
            result.pathList[0].edgeFeatures.features.forEach(item => {
                if (item.properties.NAME && !roadList.some(road => road.name === item.properties.NAME)) {
                    roadList.push({ id: item.id, name: item.properties.NAME });
                }
            });
            const descList = [];
            result.pathList[0].pathGuideItems.features.forEach((item, index) => {
                if (item.properties.directionType !== 'NONE') {
                    const roadName = roadList.filter(road => road.id === item.properties.id);
                    descList.push(
                        `向${directionMap[item.properties.directionType]}走${parseInt(item.properties.length)}米${
                            roadName[0] ? ', 进入' + roadName[0].name + '。' : '。'
                        }`
                    );
                } else {
                    if (item.properties.sideType !== 'NONE' && index !== 0) {
                        descList.push(
                            `到达目的地, 目的地在你的${item.properties.sideType === 'LEFT' ? '左侧' : '右侧'}`
                        );
                    } else {
                        descList.push(item.properties.description);
                    }
                }
            });
            const infoList = [];
            for (let i = 0; i < descList.length; i = i + 2) {
                if (descList[i] === '继续前行') {
                    const nextNum = descList[i + 1].replace(/[^0-9]/gi, '');
                    const pre = infoList.pop();
                    const preNum = pre.replace(/[^0-9]/gi, '');
                    infoList.push(pre.replace(preNum, parseInt(preNum) + parseInt(nextNum)));
                } else {
                    infoList.push(`${descList[i]}${descList[i + 1] ? '，' + descList[i + 1] : '。'}`);
                }
            }

            setPathInfo(pre => ({ ...pre, distance: { weight: result.pathList[0].weight, info: infoList } }));
            result.pathList.map(function(result) {
                L.geoJSON(result.route, { color: 'red' }).addTo(baseMap);
            });
        });

        //{info:infoList,weight}

        const analystParameterSpeed = new SuperMap.TransportationAnalystParameter({
            resultSetting: resultSetting,
            weightFieldName: 'speed'
        });
        const findPathParameterSpeed = new SuperMap.FindPathParameters({
            isAnalyzeById: false,
            nodes: pathNodes,
            parameter: analystParameterSpeed
        });

        //进行查找(时间优先)
        findPathService.findPath(findPathParameterSpeed, serviceResult => {
            const result = serviceResult.result;
            const directionMap = {
                NORTH: '北',
                EAST: '东',
                SOURTH: '南',
                WEST: '西'
            };
            const roadList = [];
            result.pathList[0].edgeFeatures.features.forEach(item => {
                if (item.properties.NAME && !roadList.some(road => road.name === item.properties.NAME)) {
                    roadList.push({ id: item.id, name: item.properties.NAME });
                }
            });
            const descList = [];
            result.pathList[0].pathGuideItems.features.forEach((item, index) => {
                if (item.properties.directionType !== 'NONE') {
                    const roadName = roadList.filter(road => road.id === item.properties.id);
                    descList.push(
                        `向${directionMap[item.properties.directionType]}走${parseInt(item.properties.length)}米${
                            roadName[0] ? ', 进入' + roadName[0].name + '。' : '。'
                        }`
                    );
                } else {
                    if (item.properties.sideType !== 'NONE' && index !== 0) {
                        descList.push(
                            `到达目的地, 目的地在你的${item.properties.sideType === 'LEFT' ? '左侧' : '右侧'}`
                        );
                    } else {
                        descList.push(item.properties.description);
                    }
                }
            });
            const infoList = [];
            // 合并继续前行描述
            for (let i = 0; i < descList.length; i = i + 2) {
                if (descList[i] === '继续前行') {
                    const nextNum = descList[i + 1].replace(/[^0-9]/gi, '');
                    const pre = infoList.pop();
                    const preNum = pre.replace(/[^0-9]/gi, '');
                    infoList.push(pre.replace(preNum, parseInt(preNum) + parseInt(nextNum)));
                } else {
                    infoList.push(`${descList[i]}${descList[i + 1] ? '，' + descList[i + 1] : '。'}`);
                }
            }
            setPathInfo(pre => ({ ...pre, speed: { weight: result.pathList[0].weight, info: infoList } }));
            result.pathList.map(function(result) {
                L.geoJSON(result.route, { color: 'blue' }).addTo(baseMap);
            });
        });

        setNavigateVisible(true);
        setPathNodes([]);
    };
    const handleBuffer = () => {
        console.log(bufferRoute);

        // const roadLine = L.polyline(pointsList, {color: 'red'}).addTo(map);
        const bufferAnalystService = L.supermap.spatialAnalystService(bufferUrl);
        // //对生成的线路进行缓冲区分析
        const geoBufferAnalystParams = new SuperMap.GeometryBufferAnalystParameters({
            sourceGeometry: bufferRoute,
            bufferSetting: new SuperMap.BufferSetting({
                endType: SuperMap.BufferEndType.ROUND,
                leftDistance: new SuperMap.BufferDistance({ value: 0.5 }),
                rightDistance: new SuperMap.BufferDistance({ value: 0.5 }),
                semicircleLineSegment: 10,
                radiusUnit: SuperMap.BufferRadiusUnit.MILLIMETER
            })
        });
        bufferAnalystService.bufferAnalysis(geoBufferAnalystParams, serviceResult => {
            console.log(serviceResult);
            const resultLayer = L.geoJSON(serviceResult.result.resultGeometry).addTo(baseMap);
            // //查询出缓冲区内信号影响范围内的工厂
            const queryService = L.supermap.queryService(url);
            const queryByGeometryParameters = new SuperMap.QueryByGeometryParameters({
                queryParams: [new SuperMap.FilterParameter({ name: 'POI@whu_map' })],
                geometry: resultLayer,
                spatialQueryMode: SuperMap.SpatialQueryMode.INTERSECT
            });
            queryService.queryByGeometry(queryByGeometryParameters, serviceResult => {
                var result = serviceResult.result;
                const resultLayer1 = L.geoJSON(result.recordsets[0].features).addTo(baseMap);
            });
        });
    };

    const showFeedback = () => {
        const problemType = {
            logistics: t('后勤报修'),
            network: t('网络报修'),
            suggestion: t('优化建议'),
            other: t('其他')
        };
        const heatPoints = [];
        feedbackList.forEach(item => {
            L.marker(item.coordinates, {
                icon: L.icon({
                    iconUrl: item.status === 0 ? MarkerOrange : item.status === 1 ? MarkerGreen : MarkerGray,
                    iconSize: [25, 41],
                    iconAnchor: [13, 41],
                    popupAnchor: [0, -20]
                })
            })
                .bindPopup(
                    `<div>
                    <div>反馈用户: ${item.username}</div>
                    <div>反馈时间: ${moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div>${problemType[item.type]}: ${item.info_detail}</div>
                    <a>详情</a>
                    </div>`
                )
                .addTo(baseMap);
        });
    };

    const showHeatLayer = () => {
        const heatPoints = [];
        feedbackList.forEach(item => {
            heatPoints.push([...item.coordinates, item.status === 0 ? 80 : item.status === 1 ? 50 : 20]);
        });
        const heat = L.heatLayer(heatPoints, { radius: 15 }).addTo(baseMap);
    };

    const showNavigation = async locationList => {
        const resultList = [];
        for (let i in locationList) {
            const { result } = await getLocationInfo(locationList[i].location);
            resultList.push({
                ...locationList[i],
                address: result.formatted_address
            });
        }
        setNavigateVisible(true);
        setNavigateData(resultList);
    };

    return (
        <div className='base-style'>
            <div style={{ position: 'relative' }}>
                <div className='button-area'>
                    <Select
                        style={{ width: 100, marginRight: 5 }}
                        defaultValue={viewType}
                        onChange={value => {
                            handleRemove();
                            setViewType(value);
                        }}>
                        <Option value='basic'>{t('基本视图')}</Option>
                        <Option value='feedback'>{t('反馈视图')}</Option>
                        <Option value='navigation'>{t('导航视图')}</Option>
                    </Select>
                    {viewType === 'basic' && (
                        <>
                            <Button className='base-button' onClick={handleBuffer}>
                                {t('缓冲区分析')}
                            </Button>
                        </>
                    )}
                    {viewType === 'feedback' && (
                        <>
                            <Button className='base-button' onClick={showFeedback} disabled={loading}>
                                {t('展示反馈点')}
                            </Button>
                            <Button className='base-button' onClick={showHeatLayer} disabled={loading}>
                                {t('展示热力图')}
                            </Button>
                        </>
                    )}
                    {viewType === 'navigation' && (
                        <>
                            <Button
                                className='base-button'
                                onClick={async () => {
                                    if (pathNodes.length < 2) {
                                        setNavigateVisible(true);
                                    } else {
                                        const { result: startRes } = await getLocationInfo(
                                            `${pathNodes[0].lat},${pathNodes[0].lng}`
                                        );
                                        const { result: endRes } = await getLocationInfo(
                                            `${pathNodes[1].lat},${pathNodes[1].lng}`
                                        );
                                        setPointInfo([startRes.formatted_address, endRes.formatted_address]);
                                        handleFindPath(pathNodes);
                                    }
                                }}>
                                {t('路径查询')}
                            </Button>
                        </>
                    )}
                    <Button className='base-button' danger onClick={handleRemove}>
                        {t('清空图层')}
                    </Button>
                </div>
                {viewType === 'feedback' && (
                    <>
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
                            <PieEcharts data={feedbackList} />
                            <PictorialBarEcharts data={feedbackList} />
                            <LineEcharts data={feedbackList} />
                        </div>
                    </>
                )}
                {viewType === 'navigation' && (
                    <NavigateInfoDiv
                        visible={navigateVisible}
                        data={navigateData}
                        map={baseMap}
                        pointInfo={pointInfo}
                        pathInfo={pathInfo}
                        onFindPath={handleFindPath}
                        onShow={showNavigation}
                    />
                )}
                <div id='map' ref={mapRef}></div>
            </div>
        </div>
    );
}
