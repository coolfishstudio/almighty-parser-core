'use strict';
/**
 * 糗事百科
 * https://www.qiushibaike.com/
 */
module.exports = {
    // 域名 网站域名,设置域名后只处理这些域名下的网页
    domains: 'https://www.qiushibaike.com/',
    // 列表页url的正则，符合这些正则的页面会被当作列表页处理
    listUrlRegexes: [/^https:\/\/www\.qiushibaike\.com(\/[a-z0-9]+(\/page\/[0-9]+)?)?(\/)?$/],
    // 内容页url的正则，符合这些正则的页面会被当作内容页处理
    contentUrlRegexes: [/^https:\/\/www\.qiushibaike\.com\/article\/[0-9]+$/],
    // 从内容页中抽取需要的数据
    fields: [{
        // 作者
        name: 'author',
        meta: {
            selector: ['.author h2'],
            format: 'text'
        }
    }, {
        // 标签 
        name: 'tags',
        meta: {
            format: 'text',
            selector: ['.source a'],
            index: 0
        }
    }, {
        // 网页关键字
        name: 'keywords',
        meta: {
            format: 'meta',
            selector: ['meta[name="keywords"]']
        }
    }, {
        // 网页描述
        name: 'description',
        meta: {
            format: 'meta',
            selector: ['meta[name="description"]']
        }
    }, {
        // 详情
        name: 'content',
        meta: {
            selector: ['.content', '.thumb'],
            format: 'html'
        },
        required: true
    }, {
        name: 'imagesCount',
        meta: {
            selector: ['.thumb'],
            format: 'count',
            countType: 'image'
        },
        defaultValue: 0
    }, {
        name: 'wordsCount',
        meta: {
            selector: ['.content'],
            format: 'count',
            countType: 'text'
        },
        defaultValue: 0
    }, {
        name: 'comments',
        meta: {
            selector: ['.stats-comments .number'],
            format: 'text'
        },
        defaultValue: 0
    }, {
        name: 'likes',
        meta: {
            selector: ['.stats-vote .number'],
            format: 'text'
        },
        defaultValue: 0
    }],
    // 是否模拟用户请求
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    // 编码 默认utf-8
    charset: null,
    // 回调函数 对所有数据做处理
    afterExtractAll: function (data) {
        data.fields['hits'] = 0;
        return data;
    },
    afterExtractField: function (fieldsName, data) {
        if (fieldsName === 'tags') {
            data = data ? data.split(',') : [];
        }
        if (fieldsName === 'comments') {
            data = +data;
        }
        if (fieldsName === 'likes') {
            data = +data;
        }
        return data;
    }
};
