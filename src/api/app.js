import { get, post } from '@/utils/request';

export function addAppGroup(data) {
    return post('api/app/group', data);
}

export function getAppGroup(data) {
    return get('api/app/group', data);
}

export function addApplication(data) {
    return post('api/app/application', data);
}

export function getApplication(data) {
    return get('api/app/application', data);
}

export function deleteApplication(data) {
    return post('api/app/delete/application', data);
}
