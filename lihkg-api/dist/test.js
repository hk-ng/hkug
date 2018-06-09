"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
function greeter(person) {
    return `Hello ${person}!`;
}
api_1.create().then(client => {
    client.getTopicList({
        cat_id: "15",
        page: 1,
        count: 60,
        sub_cat_id: -1
    })
        .then(response => client.login({
        email: 'FUCKING@EMAIL.COM',
        password: 'FUCKINGPASSWORD'
    }))
        .then(response => client.getProperty())
        .then(response => client.getTopicList({
        cat_id: "15",
        page: 1,
        count: 60,
        sub_cat_id: -1
    }))
        .then(response => client.getThreadContent({
        thread_id: 694606,
        page: 1,
        order: api_1.ThreadOrder.replyTime
    }))
        .then(response => client.getThreadMedia({
        include_link: api_1.ThreadMediaIncludeLink.No,
        thread_id: 233711
    }))
        .then(response => client.likeThread({
        thread_id: 233711,
        like: false
    }));
});
//# sourceMappingURL=test.js.map