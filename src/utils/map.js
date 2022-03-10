import L from 'leaflet'
import { SuperMap } from '@supermap/iclient-leaflet'

const baseUrl = '8.134.215.136'

const dataUrl = `http://${baseUrl}:8090/iserver/services/data-whu_map/rest/data`
// const dataUrl = 'https://iserver.supermap.io/iserver/services/data-world/rest/data'

export const query = map => {
    const sqlParam = new SuperMap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: '学校范围@whu_map',
            attributeFilter: 'code = 2081'
        },
        datasetNames: ['whu_map:学校范围']
    })
    L.supermap.featureService(dataUrl).getFeaturesBySQL(sqlParam, function(serviceResult) {
        const resultLayer = L.geoJSON(serviceResult.result.features)
            .addTo(map)
            .bindPopup('SMID = 234')
        console.log(serviceResult)
    })
}
