import L from 'leaflet';
import { SuperMap } from '@supermap/iclient-leaflet';
import { BASE_URL } from '@/constants';

const dataUrl = `http://${BASE_URL}:8090/iserver/services/data-whu_map/rest/data`; // 数据查询url
const serviceUrl = `http://${BASE_URL}:8090/iserver/services/transportationAnalyst-whu_map/rest/networkanalyst/whu_map_Network@whu_map`; // 路径分析url

export const query = (map, filter) => {
    return new Promise((resolve, reject) => {
        let resultLayer;
        const sqlParam = new SuperMap.GetFeaturesBySQLParameters({
            queryParameter: {
                name: `POI@whu_map`,
                attributeFilter: `name = "${filter}"`
            },
            datasetNames: [`whu_map:POI`]
        });

        L.supermap.featureService(dataUrl).getFeaturesBySQL(sqlParam, function(serviceResult) {
            const features = serviceResult.result.features;
            console.log(777, features);
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
