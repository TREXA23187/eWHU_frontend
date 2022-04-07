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
import { Button, Select } from 'antd';
import { BASE_URL } from '@/constants';
import moment from 'moment';
import MarkerOrange from '@/assets/images/marker-orange.png';
import MarkerGreen from '@/assets/images/marker-green.png';
import MarkerGray from '@/assets/images/marker-gray.png';
import { getFeedbackList } from '@/api/feedback';
import { t } from 'i18next';
import { getLocationInfo } from '@/api/utils';
import NavigateInfoDiv from './navigate-info-div';
import SearchInfoDiv from './search-info-div';
import FeedbackInfoDiv from './feedback-info-div';

const Option = Select.Option;

const url = `http://${BASE_URL}:8090/iserver/services/map-whu_map/rest/maps/whu_map`;
const serviceUrl = `http://${BASE_URL}:8090/iserver/services/transportationAnalyst-whu_map/rest/networkanalyst/whu_map_Network@whu_map`; //路径分析url

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

    const [navigateVisible, setNavigateVisible] = useState(true);
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

    const changeCursorStyle = type => {
        mapRef.current.style.cursor = type;
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
                        <Option value='search'>{t('查询视图')}</Option>
                        <Option value='feedback'>{t('反馈视图')}</Option>
                        <Option value='navigation'>{t('导航视图')}</Option>
                    </Select>
                    {viewType === 'basic' && (
                        <>
                            <Button className='base-button'>{t('缓冲区分析')}</Button>
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
                {viewType === 'search' && (
                    <SearchInfoDiv map={baseMap} onClear={handleRemove} onChangeCursor={changeCursorStyle} />
                )}
                {viewType === 'feedback' && <FeedbackInfoDiv data={feedbackList} />}
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
