'use strict'
var request = require('request'),
    iconv = require('iconv-lite'),
    OpenCC = require('opencc');

/**
 * 代理
 */
var _proxy = function () {
    var proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.ALL_PROXY;
    if (proxy) {
        request = request.defaults({'proxy': proxy});
    }
};
/**
 * 请求核心
 */
var _requestCore = function (url, options, callback) {
    _proxy();
    var query = {};
    query.url = url;
    query.headers = {};
    if (options.charset && options.charset !== 'utf-8') {
        query.encoding = null;
    }
    if (options.userAgent) {
        query.headers = {
            'User-Agent': options.userAgent
        };
    }
    request.get(query, function (err, res, body) {
        if (!err && res.statusCode === 200) {
            if (options.charset && options.charset !== 'utf-8') {
                body = iconv.decode(body, options.charset);// 处理转码问题
            }
            callback(err, body);
        } else {
            console.error(err);
            return callback(err);
        }
    });
};
/**
 * 多种类型请求
 */
var _request = {
    html: function (url, options, callback) {
        _requestCore(url, options, function (error, body) {
            callback(error, body);
        });
    },
    json: function (url, options, callback) {
        _requestCore(url, options, function (error, body) {
            body = JSON.parse(body);
            callback(error, body);
        });
    },
    jsonp: function (url, options, callback) {
        _requestCore(url, options, function (error, body) {
            body = body.substring(9, body.length - 1);
            body = JSON.parse(body);
            callback(error, body);
        });
    }
};

/**
 * 请求接口
 * 支持http/json/jsonp
 */
var requestUrl = function (url, options, callback) {
    options.format = options.format || 'html';
    if (options.format === 'html') {
        _request.html(url, options, callback);
    } else if (options.format === 'json') {
        _request.json(url, options, callback);
    } else if (options.format === 'jsonp') {
        _request.jsonp(url, options, callback);
    } else {
        console.error('The request format is error.');
    }
};
/**
 * 转义 i18n
 *
 * 支持的类型：
 * 简体到繁体 s2t
 * 繁体到简体 t2s
 * 简体到台湾正体 s2tw
 * 台湾正体到简体 tw2s
 * 简体到香港繁体 s2hk
 * 香港繁体到简体 hk2s
 * 繁体到台湾正体 t2tw
 * 繁体到香港繁体 t2hk
 */
var translate = function (str, type) {
    type = type || 'tw2s'
    if (['s2t', 't2s', 's2tw', 'tw2s', 's2hk', 'hk2s', 't2tw', 't2hk'].indexOf(type) < 0) {
        console.error(type, 'in i18n is null');
        return str;
    }
    var opencc = new OpenCC(type + '.json');
    var converted = opencc.convertSync(str);
    return converted;
};

/**
 * 追加首页链接结尾的／
 */
var formatUrl = function (url) {
    if (url.split('/').length - 1 === 2) {
        url += '/';
    }
    return url;
};
/**
 * 转码
 */
var encode = function (str) {
    return str.replace(/[^\u0000-\u00FF]/g, function ($0) {
        return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2")
    });
};
var rencode = function (str) {
    return unescape(str.replace(/(&#x)(\w{4});/gi, "%u$2")).replace(/%uA0/img, ' ').replace(/&#xA0;/img, ' ');
};
/**
 * 数组去重
 */
var deDuplication = function (arr) {
    var filterObj = {};
    arr = arr.filter(function (_item) {
        if (!filterObj[_item]) {
            filterObj[_item] = true;
            return true;
        } else {
            return false;
        }
    });
    return arr;
};

module.exports = {
    request: requestUrl,
    translate: translate,
    formatUrl: formatUrl,
    encode: encode,
    rencode: rencode,
    deDuplication: deDuplication
};
