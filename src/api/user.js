import { post } from '@/utils/request'

export function login({ username, password }) {
    return post('api/users/login', { username, password })
}
