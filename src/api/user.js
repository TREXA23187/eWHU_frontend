import { get, post } from '@/utils/request'

export function login({ username, password }) {
    return post('api/users/login', { username, password })
}

export function getUserList() {
    return get('api/users/list')
}

export function addUser(data) {
    return post('api/users/register', data)
}

export function changeUserInfo(data) {
    return post('api/users/patch/info', data)
}

export function deleteUser(id) {
    return post('api/users/delete', { id })
}
