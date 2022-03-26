import { get, post } from '@/utils/request';

export function addNews(data) {
    return post('api/news', data);
}

export function getNewsList(data) {
    return get('api/news', data);
}

export function deleteNews({ id }) {
    return post('api/news/delete', { id });
}
