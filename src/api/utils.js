import { get, post } from '@/utils/request';

const ak = 'hOcvBvO2cM90OKUxFleKHwR3Nt0gAdry';

export function getLocationInfo(location) {
    return get('/baidu', {
        coordtype: 'wgs84ll',
        output: 'json',
        ak,
        location
    });
}
