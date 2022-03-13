import L from 'leaflet';
import { SuperMap } from '@supermap/iclient-leaflet';

const baseUrl = '8.134.215.136';

const dataUrl = `http://${baseUrl}:8090/iserver/services/data-whu_map/rest/data`;

export const query = (map, name, filter) => {
    let resultLayer;
    const sqlParam = new SuperMap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: `${name}@whu_map`,
            attributeFilter: filter
        },
        datasetNames: [`whu_map:${name}`]
    });
    console.log(sqlParam);
    L.supermap.featureService(dataUrl).getFeaturesBySQL(sqlParam, function(serviceResult) {
        const features = serviceResult.result.features;
        resultLayer = L.geoJSON(features)
            .addTo(map)
            .bindPopup(filter);
        console.log(features.features[0].properties);
    });
    return resultLayer;
};
