'use strict';
/**
 * healthNo1
 * http://www.healthno1.com/
 */
module.exports = {
    // 域名 网站域名,设置域名后只处理这些域名下的网页
    domains: 'http://www.healthno1.com/',
    // 列表页url的正则，符合这些正则的页面会被当作列表页处理
    listUrlRegexes: [/^http:\/\/www\.healthno1\.com(\/[a-z_]+(\.html)?)*(\/)?(\?start=[0-9]+)?$/],
    // 内容页url的正则，符合这些正则的页面会被当作内容页处理
    contentUrlRegexes: [/^http:\/\/www\.healthno1\.com\/([a-z_]+\/)*[0-9-]+\.html$/],
    // 从内容页中抽取需要的数据
    fields: [{
        // 标题
        name: 'title',
        meta: {
            // 默认 type 为 jquery/text/xpath
            selector: ['#gkContentWrap .item-page header h1'],
            format: 'text'
        },
        required: true
    }, {
        // 详情
        name: 'content',
        meta: {
            selector: ['#gkContentWrap .item-page .itemBody img', '#gkContentWrap .item-page .itemBody p'],
            format: 'html'
        },
        required: true
    }, {
        // 作者
        name: 'author',
        meta: {
            format: 'meta',
            selector: ['meta[name="author"]']
        }
    }, {
        // 标签 
        name: 'tags',
        meta: {
            format: 'text',
            selector: ['.category-name a'],
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
        name: 'imagesCount',
        meta: {
            selector: ['#gkContentWrap .item-page .itemBody img', '#gkContentWrap .item-page .itemBody p'],
            format: 'count',
            countType: 'image'
        },
        defaultValue: 0
    }, {
        name: 'wordsCount',
        meta: {
            selector: ['#gkContentWrap .item-page .itemBody img', '#gkContentWrap .item-page .itemBody p'],
            format: 'count',
            countType: 'text'
        },
        defaultValue: 0
    }, {
        name: 'publishedAt',
        meta: {
            format: 'text',
            selector: ['.created time']
        }
    }, {
        name: 'hits',
        meta: {
            format: 'text',
            selector: ['.hits'],
            index: 0
        },
        defaultValue: 0
    }],
    // 是否模拟用户请求
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    // 编码 默认utf-8
    charset: null,
    // 语言格式
    i18n: 'tw2s',
    // 回调函数 对所有数据做处理
    afterExtractAll: function (data) {
        data.fields['comments'] = 0;
        data.fields['likes'] = 0;
        return data;
    },
    afterExtractField: function (fieldsName, data) {
        if (fieldsName === 'publishedAt') {
            data = new Date(data.replace(/[^0-9\- \:]+/img, '')).getTime() || new Date().getTime();
        }
        if (fieldsName === 'tags') {
            data = (data !== '') ? [data] : [];
        }
        if (fieldsName === 'title') {
            data = data.trim();
        }
        if (fieldsName === 'hits') {
            data = data.replace(/[^0-9]+/img, '') || 0;
        }
        return data;
    }
};
