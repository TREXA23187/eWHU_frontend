import { NODE_ENV, REACT_APP_BASE_URL_DEV, REACT_APP_BASE_URL_PRO } from '@/configs/config.default';

const isProduction = NODE_ENV === 'production';

export const BASE_URL = isProduction ? REACT_APP_BASE_URL_PRO : REACT_APP_BASE_URL_DEV;
