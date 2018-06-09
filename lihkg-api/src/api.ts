import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Convert, PropertyJSON, Emojis, LoginJSON, TopicListJSON, ContentJSON, ImagesListJSON, LikeJSON, CatList} from './model';
import { v4 as uuidv4 } from 'uuid';
import { SHA1, enc } from 'crypto-js';
import { URLSearchParams } from 'url';
import { request } from 'https';

export interface LIHKG {
    getProperty(): Promise<PropertyJSON>;
    login(request: LoginRequest): Promise<LoginJSON>;
    getTopicList(request: TopicListRequest): Promise<TopicListJSON>;
    getThreadContent(request: ThreadContentRequest): Promise<ContentJSON>;
    reply(request: ReplyRequest): Promise<any>;
    getThreadMedia(request: ThreadMediaRequest): Promise<ImagesListJSON>;
    likeThread(request: LikeThreadRequest): Promise<LikeJSON>;
    likePost(request: LikePostRequest): Promise<any>;
}

export enum ThreadOrder {
    replyTime = 'reply_time',
    score = 'score'
}

export interface LoginRequest {
    email: string,
    password: string,
}

export interface ThreadMediaRequest {
    thread_id: number,
    include_link: ThreadMediaIncludeLink
}

export enum ThreadMediaIncludeLink {
    Yes = '1',
    No = '0'
}

export interface TopicListRequest {
    cat_id: string,
    sub_cat_id: number,
    page: number,
    count: number,
}

export interface ThreadContentRequest {
    thread_id: number,
    page: number,
    order: ThreadOrder,
}

export interface ReplyRequest {
    thread_id: number,
    content: string,
}

export interface LikeThreadRequest {
    thread_id: number,
    like: boolean
}

export interface LikePostRequest {
    thread_id: number,
    post_id: string,
    like: boolean,
}

export function getEmoji() {
    return axios
        .get('https://x.lihkg.com/hkgmoji.json')
        .then(response => Convert.toEmojis(response.data));
};

export function create(): Promise<LIHKG> {
    let device = enc.Hex.stringify(SHA1(uuidv4()));
    let instance = axios.create({
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
    let property: CatList[];
    const apiEndPoint: LIHKG = {
        getProperty: () =>
            instance
                .get('https://lihkg.com/api_v2/system/property')
                .then(response => {
                    const propertyJson = Convert.toPropertyJSON(response.data);
                    property = propertyJson.response.category_list;
                    return propertyJson;
                }),
        login: (request) =>
            instance
                .post('https://lihkg.com/api_v2/auth/login', new URLSearchParams(Object.entries(request)).toString())
                .then(function (response) {
                    let loginJson = Convert.toLoginJSON(response.data);
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
            let query = {
                ...subCategory.query,
                cat_id: request.sub_cat_id.toString(),
                page: request.page.toString(),
                count: request.count.toString()
            };
            return instance
                .get(subCategory.url + '/' + new URLSearchParams(Object.entries(query)).toString())
                .then(response => Convert.toTopicListJSON(response.data));
        },
        getThreadContent: request =>
            instance
                .get(`https://lihkg.com/api_v2/thread/${request.thread_id}/page/${request.page}?order=${request.order}`)
                .then(response => Convert.toContentJSON(response.data)),
        reply: request =>
            instance
                .post('https://lihkg.com/api_v2/thread/reply', new URLSearchParams(Object.entries(request)).toString())
                .then(response => JSON.parse(response.data)),
        getThreadMedia: request =>
            instance
                .get(`https://lihkg.com/api_v2/thread/${request.thread_id}/media?` + new URLSearchParams(Object.entries(request)).toString())
                .then(response => Convert.toImagesListJSON(response.data)),
        likeThread: request =>
            instance
                .post(`https://lihkg.com/api_v2/thread/${request.thread_id}/${request.like?'like':'dislike'}`)
                .then(response => Convert.toLikeJSON(response.data)),
        likePost: request =>
            instance
                .post(`https://lihkg.com/api_v2/thread/${request.thread_id}/${request.post_id}/${request.like?'like':'dislike'}`)
                .then(response => JSON.parse(response.data))
    };
    const injectAxiosRequestConfig = function(config: AxiosRequestConfig): AxiosRequestConfig{
        if (login) {
            let timeStamp = Math.floor(Date.now() / 1000);
            let newConfig = {
                ...config,
                headers: {
                    ...config.headers,
                    'X-LI-REQUEST-TIME': timeStamp,
                    'X-LI-DIGEST': enc.Hex.stringify(SHA1(['jeams', config.method, config.url, config.data, token, timeStamp].join('$')))
                }
            };
            console.log(newConfig);
            return newConfig;
        } else {
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
        } else {
            return injectAxiosRequestConfig(config);
        }
    });
    instance.interceptors.response.use(response => {
        console.log(JSON.parse(response.data));
        return response;
    });
    return apiEndPoint.getProperty().then(()=> apiEndPoint);
}