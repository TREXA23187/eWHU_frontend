import L from 'leaflet';
import { SuperMap } from '@supermap/iclient-leaflet';
import { BASE_URL } from '@/constants';

const url = `http://${BASE_URL}:8090/iserver/services/map-whu_map/rest/maps/whu_map`;
const dataUrl = `http://${BASE_URL}:8090/iserver/services/data-whu_map/rest/data`; // 数据查询url
const serviceUrl = `http://${BASE_URL}:8090/iserver/services/transportationAnalyst-whu_map/rest/networkanalyst/whu_map_Network@whu_map`; // 路径分析url
const bufferUrl = `http://${BASE_URL}:8090/iserver/services/spatialAnalysis-whu_map/restjsr/spatialanalyst`; //缓冲区分析url

export const query = (map, filter) => {
    return new Promise((resolve, reject) => {
        let resultLayer;
        const sqlParam = new SuperMap.GetFeaturesBySQLParameters({
            queryParameter: {
                name: `POI@whu_map`,
                attributeFilter: `name like "%${filter}%"`
            },
            datasetNames: [`whu_map:POI`]
        });

        L.supermap.featureService(dataUrl).getFeaturesBySQL(sqlParam, function(serviceResult) {
            const features = serviceResult.result.features;
            resultLayer = L.geoJSON(features, {
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`${feature.properties.NAME || 'undefined'}`);
                }
            }).addTo(map);

            resolve(features);
        });
    });
};

export const queryPOIByCode = (map, filter) => {
    return new Promise((resolve, reject) => {
        let resultLayer;
        const sqlParam = new SuperMap.GetFeaturesBySQLParameters({
            queryParameter: {
                name: `POI@whu_map`,
                attributeFilter: `code = "${filter}"`
            },
            datasetNames: [`whu_map:POI`]
        });

        L.supermap.featureService(dataUrl).getFeaturesBySQL(sqlParam, function(serviceResult) {
            const features = serviceResult.result.features;
            resultLayer = L.geoJSON(features, {
                onEachFeature: (feature, layer) => {
                    layer.bindPopup(`${feature.properties.NAME || 'undefined'}`);
                }
            }).addTo(map);

            resolve(features);
        });
    });
};

export const findPath = (map, pathNodes, callback) => {
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
    const analystParameter = new SuperMap.TransportationAnalystParameter({
        resultSetting: resultSetting,
        weightFieldName: 'SmLength'
    });
    const findPathParameter = new SuperMap.FindPathParameters({
        isAnalyzeById: false,
        nodes: pathNodes,
        parameter: analystParameter
    });

    //进行查找
    findPathService.findPath(findPathParameter, serviceResult => {
        const result = serviceResult.result;
        result.pathList.map(function(result) {
            L.geoJSON(result.route, { color: 'red' }).addTo(map);
            // setBufferRoute(result.route);
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
        });
        callback(result);
    });
};

export const queryByBuffer = (map, source, distance, type) => {
    return new Promise((resolve, reject) => {
        const bufferAnalystService = L.supermap.spatialAnalystService(bufferUrl);
        // //对生成的线路进行缓冲区分析
        const geoBufferAnalystParams = new SuperMap.GeometryBufferAnalystParameters({
            sourceGeometry: source,
            bufferSetting: new SuperMap.BufferSetting({
                endType: SuperMap.BufferEndType.ROUND,
                leftDistance: new SuperMap.BufferDistance({ value: distance }),
                rightDistance: new SuperMap.BufferDistance({ value: distance }),
                semicircleLineSegment: 50,
                radiusUnit: SuperMap.BufferRadiusUnit.MILLIMETER
            })
        });
        bufferAnalystService.bufferAnalysis(geoBufferAnalystParams, serviceResult => {
            const features = serviceResult.result.features;
            const resultLayer = L.geoJSON(serviceResult.result.resultGeometry).addTo(map);
            const queryService = L.supermap.queryService(url);
            const queryByGeometryParameters = new SuperMap.QueryByGeometryParameters({
                queryParams: [
                    new SuperMap.FilterParameter({
                        name: 'POI@whu_map',
                        attributeFilter: type ? `code = "${type}" ` : undefined
                    })
                ],
                geometry: resultLayer,
                spatialQueryMode: SuperMap.SpatialQueryMode.INTERSECT
            });
            queryService.queryByGeometry(queryByGeometryParameters, queryResult => {
                const features = queryResult.result.recordsets[0].features;
                const queryLayer = L.geoJSON(features, {
                    onEachFeature: (feature, layer) => {
                        layer.bindPopup(`${feature.properties.name || 'undefined'}`);
                    }
                }).addTo(map);
                resolve(features);
            });
        });
    });
};

export const measureDistance = (start, end) => {
    return new Promise((resolve, reject) => {
        var polyLine = L.polyline([start, end]);
        var distanceMeasureParam = new SuperMap.MeasureParameters(polyLine);
        L.supermap.measureService(url).measureDistance(distanceMeasureParam, function(serviceResult) {
            resolve(serviceResult.result);
        });
    });
};
