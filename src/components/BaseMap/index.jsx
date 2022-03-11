import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import '@supermap/iclient-leaflet'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import './index.less'
import { SuperMap } from '@supermap/iclient-leaflet'
import { BasemapType } from '@/constants/basemap'
// import walkIcon from "../../assets/image/walk.png"
import { Button, Form, Input, Select, Alert, Result } from 'antd'
import { query } from '@/utils/map'

import SearchDataModel from './search-data-model'

const baseUrl = '8.134.215.136'

const url = `http://${baseUrl}:8090/iserver/services/map-whu_map/rest/maps/whu_map`
const serviceUrl = `http://${baseUrl}:8090/iserver/services/transportationAnalyst-whu_map/rest/networkanalyst/whu_map_Network@whu_map` //路径分析url
const bufferUrl = `http://${baseUrl}:8090/iserver/services/spatialAnalysis-whu_map/restjsr/spatialanalyst` //缓冲区分析url

const host = window.isLocal ? window.server : 'https://iserver.supermap.io'
const urlQuery = host + '/iserver/services/map-china400/rest/maps/China_4326'
const wsHost = 'wss://' + (window.isLocal ? document.location.hostname + ':8800' : 'iclsvrws.supermap.io')
const urlDataFlow = wsHost + '/iserver/services/dataflowTest/dataflow'

export default function BaseMap(props) {
    const { t, i18n } = useTranslation()

    const [baseMap, setBaseMap] = useState(null)

    const [editableLayer, setEditableLayer] = useState(null)
    const [markerLayer, setMarkerLayer] = useState(null)
    const [tiandituType, setTiandituType] = useState(BasemapType.vec)
    const [pathNodes, setPathNodes] = useState([])
    const [layersList, setLayersList] = useState([])

    const [bufferRoute, setBufferRoute] = useState(null)

    const [visible, setVisible] = useState(false)

    const mapRef = useRef(null)

    useEffect(() => {
        const map = L.map(mapRef.current, {
            center: [30.538945198059086, 114.35969352722168],
            zoom: 12,
            crs: L.CRS.TianDiTu_WGS84,
            attributionControl: false, //隐藏copyright
            invalidateSize: true
        })

        setBaseMap(map)

        const editableLayers = new L.FeatureGroup()
        map.addLayer(editableLayers)
        setEditableLayer(editableLayers)

        const markerLayers = new L.FeatureGroup()
        map.addLayer(markerLayers)
        setMarkerLayer(markerLayers)

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
        }

        const drawControl = new L.Control.Draw(options)
        map.addControl(drawControl)

        handleMapEvent(drawControl._container, map)
        map.on(L.Draw.Event.CREATED, function(e) {
            const type = e.layerType
            const layer = e.layer

            if (type === 'marker') {
                const { lat, lng } = e.layer._latlng
                setPathNodes(pre => {
                    layer.bindPopup(`node ${pre.length + 1}`)
                    return [...pre, L.latLng(lat, lng)]
                })
            }
            editableLayers.addLayer(layer)
            const geo = L.Util.transform(e.layer, L.CRS.TianDiTu_WGS84, L.CRS.EPSG4326)

            const param = new SuperMap.QueryByGeometryParameters({
                // queryParams: { name: "bus_route@bus_route" },
                queryParams: { name: 'POI@whu_map' },
                geometry: geo
            })

            L.supermap.queryService(url).queryByGeometry(param, serviceResult => {
                const result = serviceResult.result
                const features = L.Util.transform(result.recordsets[0].features, L.CRS.EPSG4326, L.CRS.TianDiTu_WGS84)
                L.geoJSON(features, {
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`${feature.properties.name || 'undefined'}`)
                    }
                }).addTo(markerLayers)
            })
        })

        function handleMapEvent(div, map) {
            if (!div || !map) {
                return
            }
            div.addEventListener('mouseover', function() {
                map.scrollWheelZoom.disable()
                map.doubleClickZoom.disable()
            })
            div.addEventListener('mouseout', function() {
                map.scrollWheelZoom.enable()
                map.doubleClickZoom.enable()
            })
        }

        const tiandituLayer = L.supermap
            .tiandituTileLayer({
                layerType: BasemapType.vec,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map)
        const tiandituLayerImg = L.supermap
            .tiandituTileLayer({
                layerType: BasemapType.img,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map)
        const tiandituLabelLayer = L.supermap
            .tiandituTileLayer({
                layerType: tiandituType,
                isLabel: true,
                key: '1d109683f4d84198e37a38c442d68311'
            })
            .addTo(map)
        const whuLayer = L.supermap.tiledMapLayer(url).addTo(map)

        setLayersList([
            tiandituLayer._leaflet_id,
            tiandituLabelLayer._leaflet_id,
            whuLayer._leaflet_id,
            editableLayers._leaflet_id,
            markerLayers._leaflet_id
        ])

        const baseMaps = {
            img: tiandituLayerImg,
            vec: tiandituLayer
        }
        const overlayMaps = {
            campas: whuLayer
        }
        // 添加控件
        L.control.scale().addTo(map)
        L.control.layers(baseMaps, overlayMaps).addTo(map)

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
        //     console.log(result)
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
    }, [])

    const handleRemove = () => {
        baseMap.eachLayer(layer => {
            console.log(layersList)
            const needRemove = !layersList.includes(layer._leaflet_id)
            needRemove && layer.remove()
        })
        // editableLayer.remove();
        // markerLayer.remove();
    }

    const handleFindPath = () => {
        console.log(pathNodes)

        const findPathService = L.supermap.networkAnalystService(serviceUrl)
        const resultSetting = new SuperMap.TransportationAnalystResultSetting({
            returnEdgeFeatures: true,
            returnEdgeGeometry: true,
            returnEdgeIDs: true,
            returnNodeFeatures: true,
            returnNodeGeometry: true,
            returnNodeIDs: true,
            returnPathGuides: true,
            returnRoutes: true
        })
        const analystParameter = new SuperMap.TransportationAnalystParameter({
            resultSetting: resultSetting,
            //   weightFieldName: "SmLength",
            weightFieldName: 'SmLength'
        })
        const findPathParameter = new SuperMap.FindPathParameters({
            isAnalyzeById: false,
            nodes: pathNodes,
            parameter: analystParameter
        })
        const myIcon = L.icon({
            iconUrl: '../../assets/image/walk.png',
            iconSize: [20, 20]
        })
        //进行查找
        findPathService.findPath(findPathParameter, serviceResult => {
            const result = serviceResult.result
            console.log(123123, serviceResult)
            result.pathList.map(function(result) {
                L.geoJSON(result.route, { color: 'red' }).addTo(baseMap)
                setBufferRoute(result.route)
                // L.geoJSON(result.pathGuideItems, {
                //   pointToLayer: function (geoPoints, latlng) {
                //     L.marker(latlng).addTo(map);
                //   },
                //   filter: function (geoJsonFeature) {
                //     if (
                //       geoJsonFeature.geometry &&
                //       geoJsonFeature.geometry.type === "Point"
                //     ) {
                //       return true;
                //     }
                //     return false;
                //   },
                // }).addTo(map);
            })
            setPathNodes([])
        })
    }

    const handleShow = () => {
        editableLayer.eachLayer(layer => {
            console.log(layer)
            // editableLayer.removeLayer(layer)
        })
    }

    const handleBuffer = () => {
        console.log(bufferRoute)

        // const roadLine = L.polyline(pointsList, {color: 'red'}).addTo(map);
        const bufferAnalystService = L.supermap.spatialAnalystService(bufferUrl)
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
        })
        bufferAnalystService.bufferAnalysis(geoBufferAnalystParams, serviceResult => {
            console.log(serviceResult)
            const resultLayer = L.geoJSON(serviceResult.result.resultGeometry).addTo(baseMap)
            // //查询出缓冲区内信号影响范围内的工厂
            const queryService = L.supermap.queryService(url)
            const queryByGeometryParameters = new SuperMap.QueryByGeometryParameters({
                queryParams: [new SuperMap.FilterParameter({ name: 'POI@whu_map' })],
                geometry: resultLayer,
                spatialQueryMode: SuperMap.SpatialQueryMode.INTERSECT
            })
            queryService.queryByGeometry(queryByGeometryParameters, serviceResult => {
                var result = serviceResult.result
                const resultLayer1 = L.geoJSON(result.recordsets[0].features).addTo(baseMap)
            })
        })
    }

    return (
        <div>
            <div className='base-style'>
                <div className='button-area'>
                    <Button
                        className='base-button'
                        onClick={() => {
                            // query(baseMap)
                            setVisible(true)
                        }}>
                        {t('数据查询')}
                    </Button>
                    <Button className='base-button'>何时使用</Button>
                    <Button className='base-button'>何时使用</Button>
                </div>
                <div id='map' ref={mapRef}></div>
            </div>
            <div className='button-group'>
                <button onClick={handleShow}>show layers</button>
                <button onClick={handleRemove}>remove</button>
                <button onClick={handleFindPath}>match</button>
                <button onClick={handleBuffer}>buffer</button>
            </div>
            <SearchDataModel visible={visible} onClose={() => setVisible(false)} map={baseMap} />
        </div>
    )
}
