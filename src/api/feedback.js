import { get, post } from '@/utils/request';

export function addFeedback(data) {
    return post('api/feedback', data);
}

export function getFeedbackList(data) {
    return get('api/feedback/list', data);
}

export function changeStatus({ id, status }) {
    return post('api/feedback/patch/status', { id, status });
}
