export const ss = {
    get(key, defaultVal = null) {
        const ssData = window.sessionStorage.getItem(key);
        return ssData ? JSON.parse(ssData) : defaultVal;
    },
    set(key, val) {
        return window.sessionStorage.setItem(key, JSON.stringify(val));
    },
    remove(key) {
        return window.sessionStorage.removeItem(key);
    },
    clear() {
        return window.sessionStorage.clear();
    }
};

export const ls = {
    get(key, defaultVal = null) {
        const lsData = window.localStorage.getItem(key);
        return lsData ? JSON.parse(lsData) : defaultVal;
    },

    set(key, val) {
        return window.localStorage.setItem(key, JSON.stringify(val));
    },

    remove(key) {
        return window.localStorage.removeItem(key);
    },

    clear() {
        return window.localStorage.clear();
    }
};
