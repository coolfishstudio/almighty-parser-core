'use strict';
/**
 * 爆料网
 * http://www.baoliao5.com/
 */
module.exports = {
    // 域名 网站域名,设置域名后只处理这些域名下的网页
    domains: 'http://www.baoliao5.com/',
    // 列表页url的正则，符合这些正则的页面会被当作列表页处理
    listUrlRegexes: [/http:\/\/www\.baoliao5\.com\/((?!meitu)[a-z]+\/?)*$/, /http:\/\/www\.baoliao5\.com\/((?!meitu)[a-z]+\/?)+\/list[0-9_]+\.html*$/],
    // 内容页url的正则，符合这些正则的页面会被当作内容页处理
    contentUrlRegexes: [/http:\/\/www\.baoliao5\.com\/(?!meitu)[a-z]+\/[0-9]+\/[0-9]+\.html/],
    // 从内容页中抽取需要的数据
    fields: [{
        // 标题
        name: 'title',
        meta: {
            // 默认 type 为 jquery/text/xpath
            selector: ['.t4Btit'],
            format: 'text'
        },
        required: true
    }, {
        // 详情
        name: 'content',
        meta: {
            selector: ['#icontent'],
            format: 'html'
        },
        required: true
    }, {
        // 作者
        name: 'author',
        meta: {
            selector: ['.t4Bexp'],
            format: 'text'
        }
    }, {
        // 标签 
        name: 'tags',
        meta: {
            format: 'text',
            selector: ['.itj_lt .lc a'],
            index: 1
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
            selector: ['#icontent'],
            format: 'count',
            countType: 'image'
        },
        defaultValue: 0
    }, {
        name: 'wordsCount',
        meta: {
            selector: ['#icontent'],
            format: 'count',
            countType: 'text'
        },
        defaultValue: 0
    }, {
        name: 'publishedAt',
        meta: {
            format: 'text',
            selector: ['.t4Bexp']
        }
    }],
    // 内容下一页
    contentPage: {
        urls: [/http:\/\/www\.baoliao5\.com\/(?!meitu)[a-z]+\/[0-9]+\/[0-9]+_[0-9]+\.html/],
        selector: ['#icontent'],
        appendNode: '#icontent'
    },
    // 是否模拟用户请求
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
    // 编码 默认utf-8
    charset: 'gb2312',
    // 回调函数 对所有数据做处理
    afterExtractAll: function (data) {
        data.fields['comments'] = 0;
        data.fields['hits'] = 0;
        data.fields['likes'] = 0;
        return data;
    },
    afterExtractField: function (fieldsName, data) {
        if (fieldsName === 'author') {
            data = data.trim()
            if (data.indexOf('编辑：') >= 0) {
                var arr = data.split('编辑：');
                data = arr[arr.length - 1];
            } else {
                data = '';
            }
        }
        if (fieldsName === 'publishedAt') {
            data = new Date(data.replace(/[^0-9\-\: ]+/img, '')).getTime() || new Date().getTime();
        }
        if (fieldsName === 'tags') {
            data = (data !== '') ? [data] : [];
        }
        return data;
    }
};
