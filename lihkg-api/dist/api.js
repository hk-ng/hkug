"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const model_1 = require("./model");
const uuid_1 = require("uuid");
const crypto_js_1 = require("crypto-js");
const url_1 = require("url");
var ThreadOrder;
(function (ThreadOrder) {
    ThreadOrder["replyTime"] = "reply_time";
    ThreadOrder["score"] = "score";
})(ThreadOrder = exports.ThreadOrder || (exports.ThreadOrder = {}));
var ThreadMediaIncludeLink;
(function (ThreadMediaIncludeLink) {
    ThreadMediaIncludeLink["Yes"] = "1";
    ThreadMediaIncludeLink["No"] = "0";
})(ThreadMediaIncludeLink = exports.ThreadMediaIncludeLink || (exports.ThreadMediaIncludeLink = {}));
function getEmoji() {
    return axios_1.default
        .get('https://x.lihkg.com/hkgmoji.json')
        .then(response => model_1.Convert.toEmojis(response.data));
}
exports.getEmoji = getEmoji;
;
function create() {
    let device = crypto_js_1.enc.Hex.stringify(crypto_js_1.SHA1(uuid_1.v4()));
    let instance = axios_1.default.create({
        headers: {
            'X-LI-DEVICE': device,
            'X-LI-DEVICE-TYPE': 'android',
            'User-Agent': 'LIHKG/16.0.4 Android/9.0.0 Google/Pixel XL',
            'orginal': 'https://lihkg.com',
            'referer': 'https://lihkg.com/category/1',
        },
        transformResponse: req => req
    });
    let token = '';
    let login = false;
    let initProperty = true;
    let property;
    const apiEndPoint = {
        getProperty: () => instance
            .get('https://lihkg.com/api_v2/system/property')
            .then(response => {
            const propertyJson = model_1.Convert.toPropertyJSON(response.data);
            property = propertyJson.response.category_list;
            return propertyJson;
        }),
        login: (request) => instance
            .post('https://lihkg.com/api_v2/auth/login', new url_1.URLSearchParams(Object.entries(request)).toString())
            .then(function (response) {
            let loginJson = model_1.Convert.toLoginJSON(response.data);
            if (loginJson.success) {
                token = loginJson.response.token;
                login = true;
                instance.defaults.headers.common['X-LI-USER'] = loginJson.response.user.user_id;
            }
            return loginJson;
        }),
        getTopicList: request => {
            const category = property.find(element => element.cat_id == request.cat_id);
            if (category === undefined) {
                return Promise.reject(new Error('invalid category id'));
            }
            const subCategory = category.sub_category.find(element => element.sub_cat_id == request.sub_cat_id);
            if (subCategory === undefined) {
                return Promise.reject(new Error('invalid sub category id'));
            }
            let query = Object.assign({}, subCategory.query, { cat_id: request.sub_cat_id.toString(), page: request.page.toString(), count: request.count.toString() });
            return instance
                .get(subCategory.url + '/' + new url_1.URLSearchParams(Object.entries(query)).toString())
                .then(response => model_1.Convert.toTopicListJSON(response.data));
        },
        getThreadContent: request => instance
            .get(`https://lihkg.com/api_v2/thread/${request.thread_id}/page/${request.page}?order=${request.order}`)
            .then(response => model_1.Convert.toContentJSON(response.data)),
        reply: request => instance
            .post('https://lihkg.com/api_v2/thread/reply', new url_1.URLSearchParams(Object.entries(request)).toString())
            .then(response => JSON.parse(response.data)),
        getThreadMedia: request => instance
            .get(`https://lihkg.com/api_v2/thread/${request.thread_id}/media?` + new url_1.URLSearchParams(Object.entries(request)).toString())
            .then(response => model_1.Convert.toImagesListJSON(response.data)),
        likeThread: request => instance
            .post(`https://lihkg.com/api_v2/thread/${request.thread_id}/${request.like ? 'like' : 'dislike'}`)
            .then(response => model_1.Convert.toLikeJSON(response.data)),
        likePost: request => instance
            .post(`https://lihkg.com/api_v2/thread/${request.thread_id}/${request.post_id}/${request.like ? 'like' : 'dislike'}`)
            .then(response => JSON.parse(response.data))
    };
    const injectAxiosRequestConfig = function (config) {
        if (login) {
            let timeStamp = Math.floor(Date.now() / 1000);
            let newConfig = Object.assign({}, config, { headers: Object.assign({}, config.headers, { 'X-LI-REQUEST-TIME': timeStamp, 'X-LI-DIGEST': crypto_js_1.enc.Hex.stringify(crypto_js_1.SHA1(['jeams', config.method, config.url, config.data, token, timeStamp].join('$'))) }) });
            console.log(newConfig);
            return newConfig;
        }
        else {
            console.log(config);
            return config;
        }
    };
    instance.interceptors.request.use((config) => {
        if (initProperty) {
            initProperty = false;
            return apiEndPoint
                .getProperty()
                .then(response => injectAxiosRequestConfig(config));
        }
        else {
            return injectAxiosRequestConfig(config);
        }
    });
    instance.interceptors.response.use(response => {
        console.log(JSON.parse(response.data));
        return response;
    });
    return apiEndPoint.getProperty().then(() => apiEndPoint);
}
exports.create = create;
//# sourceMappingURL=api.js.map