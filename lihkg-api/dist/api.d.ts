import { PropertyJSON, Emojis, LoginJSON, TopicListJSON, ContentJSON, ImagesListJSON, LikeJSON } from './model';
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
export declare enum ThreadOrder {
    replyTime = "reply_time",
    score = "score"
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface ThreadMediaRequest {
    thread_id: number;
    include_link: ThreadMediaIncludeLink;
}
export declare enum ThreadMediaIncludeLink {
    Yes = "1",
    No = "0"
}
export interface TopicListRequest {
    cat_id: string;
    sub_cat_id: number;
    page: number;
    count: number;
}
export interface ThreadContentRequest {
    thread_id: number;
    page: number;
    order: ThreadOrder;
}
export interface ReplyRequest {
    thread_id: number;
    content: string;
}
export interface LikeThreadRequest {
    thread_id: number;
    like: boolean;
}
export interface LikePostRequest {
    thread_id: number;
    post_id: string;
    like: boolean;
}
export declare function getEmoji(): Promise<Emojis[]>;
export declare function create(): Promise<LIHKG>;
