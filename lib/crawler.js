'use strict';
var async = require('async');

var helper = require('./helper'),
    parser = require('./parser'); 

function Crawler (options) {
    options = options || {};
    if (!['domains', 'listUrlRegexes', 'contentUrlRegexes', 'fields'].some(key => key in options)) {
        throw new Error('options is invalid data format.');
    }
    // 初始化
    this._init(options);
};
/**
 * 初始化
 */
Crawler.prototype._init = function (options) {
    options.domains = helper.formatUrl(options.domains);
    // 核心
    this.domains = options.domains || '';// 域名 首页
    this.listUrlRegexes = options.listUrlRegexes || [];// 列表页url的正则
    this.contentUrlRegexes = options.contentUrlRegexes || [];// 内容页url的正则
    this.fields = options.fields || [];// 从内容页中抽取需要的数据
    this.contentPage = options.contentPage || null;// 下一页
    // 配置
    this.userAgent = options.userAgent || null;// 模拟用户请求
    this.charset = options.charset || null;// 编码
    this.format = options.format || 'html';// 请求格式 http|json|jsonp
    this.i18n = options.i18n || null;// 转译 繁体转简体 s2t | t2s | s2tw | tw2s | s2hk | hk2s | t2tw | t2hk
    // 函数
    this.afterExtractField = options.afterExtractField || null;// 对每一个抓取的数据进行处理
    this.afterExtractAll = options.afterExtractAll || null;// 对完整的数据进行一个处理
    this.afterExtractUrls = options.afterExtractUrls || null;// 对抓取的url进行一个处理
    this.attachFields = options.attachFields || null;// 附加数据
};
/**
 * 检测链接类型
 * 可选参数
 * type: list|post
 */
Crawler.prototype._judge = function (url, type) {
    var result = '';
    if (!type || type === 'list') {
        this.listUrlRegexes.forEach(function (urlRegex) {
            if (urlRegex.test(url)) {
                result = 'list';
            }
        });
    }
    if (!type || type === 'post') {
        this.contentUrlRegexes.forEach(function (urlRegex) {
            if (urlRegex.test(url)) {
                result = 'post';
            }
        });
    }
    return type ? result === type : result;
};
/**
 * 根据url生成唯一标示
 */
Crawler.prototype._getSourceId = function (url) {
    var type = this._judge(url);
    if (!type) {
        console.error('The url type is not list or post.');
        return null;
    }
    var regex = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i;
    var arr = url.match(regex);
    this._site = arr[2];
    var sources = '';
    [2, 4, 5].forEach(function (item) {
        if (!!arr[item]) {
            if (item === 2) {
                sources += arr[item].split('.').reverse().join('.');
            } else {
                sources += arr[item].replace(/\//img, '-').replace('.', '-');
            }
        }
    });
    sources = ((sources.substring(sources.length - 1) === '-') ? sources.substring(0, sources.length - 1) : sources).trim();
    return sources;
};
/**
 * 解析详情页
 */
Crawler.prototype._getContent = function (url, callback) {
    var self = this;
    self.url = url;
    var result = {};
    var resultAttachFields = {};
    result.bodyData = null;
    result.fields = null;
    // 处理附加数据
    var getAttachBodyFields = function (done) {
        if (!self._judge(url, 'post')) {
            return done(null);
        }
        if (!self.attachFields) {
            return done(null);
        }
        if (!self.attachFields.url) {
            return done(null);
        }
        parser.getAttachUrl({
            url: self.attachFields.url,
            meta: self.attachFields.meta,
            body: result.bodyData
        }, function (error, _url) {
            helper.request(_url, {
                format: self.format,
                charset: self.charset,
                userAgent: self.userAgent
            }, function (error, body) {
                if (error) {
                    return done(error);
                }
                resultAttachFields = parser.getFieldsBySelector(body, self.attachFields.fields);
                done(error);
            });
        });
    };
    var getBodyPage = function (done) {
        if (!(self._judge(url, 'post') && !!result.bodyData && !!self.contentPage)) {
            return done(null);
        }
        // 处理下一页
        parser.getContentPage(self, { body: result.bodyData, url }, function (error, body) {
            if (error) {
                return done(error);
            }
            if (body) {
                result.bodyData = body;
            }
            done(error);
        });
    };
    var getBodyFields = function (done) {
        helper.request(url, {
            format: self.format,
            charset: self.charset,
            userAgent: self.userAgent
        }, function (error, body) {
            if (error) {
                return done(error);
            }
            result.bodyData = body;
            done(error);
        });
    };
    async.waterfall([getBodyFields, getBodyPage, getAttachBodyFields], function (error) {
        if (error) {
            return callback(error);
        }

        if (self._judge(url, 'post') && !!result.bodyData) {
            // 获取数据
            result.fields = parser.getFields(result.bodyData, self);
            result.fields.from = url;
            result.fields.sourceId = self._getSourceId(url);
            result.fields.site = self._site;
            // 附加数据
            for (var name in resultAttachFields) {
                result.fields[name] = resultAttachFields[name];
            }
            // 处理完整数据
            if (self.afterExtractAll) {
                result = self.afterExtractAll(result);
            }
        }
        callback(error, result);
    });
};
/**
 * 解析列表页
 */
Crawler.prototype._getLinks = function (url, callback) {
    var self = this;
    helper.request(url, {
        format: self.format,
        charset: self.charset,
        userAgent: self.userAgent
    }, function (error, body) {
        var result = {};
        result.urls = null;
        if (body) {
            result.urls = this._parseUrls(body, url);
        }
        callback(error, result);
    });
};
/**
 * 解析url
 */
Crawler.prototype._parseUrls = function (bodyData, url) {
    var self = this;
    self.url = url;
    return parser.getUrls(bodyData, self);
};
/**
 * 解析获取内容[为`getLinks`与`getContent`的集合]
 */
Crawler.prototype.parse = function (url, callback) {
    url = helper.formatUrl(url);
    var self = this;
    var type = null;
    var result = {};
    var bodyData = null;

    // 获取页面的数据
    var parserUrls = function (data, done) {
        result.urls = null;
        if (!!bodyData) {
            result.urls = self._parseUrls(bodyData, url);
        }
        done(null, result);
    };
    // 获取页面的链接
    var parserFields = function (type, done) {
        self._getContent(url, function (error, data) {
            if (!data || error) {
                return done(error);
            }
            bodyData = data.bodyData;
            result.fields = data.fields;
            done(null, result);
        });
    };
    // 判断是否为url
    var judge = function (done) {
        type = self._judge(url);
        if (type) {
            done(null, type);
        } else {
            done('url mismatch');
        }
    };
    return new Promise(function (resolve, reject) {
        async.waterfall([judge, parserFields, parserUrls], function (error, result) {
            if (error) {
                console.error(error);
                if (callback) return callback(error);
                return reject(error);
            }
            resolve(result);
            if (callback) {
                callback(null, result);
            }
        });
    });
};
/**
 * 获取待抓页链接
 */
Crawler.prototype.getLinks = function (url, callback) {
    url = helper.formatUrl(url);
    var self = this;
    var type = this._judge(url);
    if (!type) return null;
    return new Promise(function (resolve, reject) {
        self._getLinks(url, function (error, result) {
            if (error) {
                console.error(error);
                if (callback) return callback(error);
                return reject(error);
            }
            resolve(result.urls);
            if (callback) {
                callback(null, result.urls);
            }
        });
    });
};
/**
 * 获取详情页内容
 */
Crawler.prototype.getContent = function (url, callback) {
    url = helper.formatUrl(url);
    var self = this;
    var type = this._judge(url);
    if (!type) return null;
    if (!this.isArticleUrl(url)) return null;
    return new Promise(function (resolve, reject) {
        self._getContent(url, function (error, result) {
            if (error) {
                console.error(error);
                if (callback) return callback(error);
                return reject(error);
            }
            resolve(result.fields);
            if (callback) {
                callback(null, result.fields);
            }
        });
    });
};
/**
 * 检测链接是否是详情页
 */
Crawler.prototype.isArticleUrl = function (url) {
    url = helper.formatUrl(url);
    return this._judge(url, 'post');
};
/**
 * 检测链接是否是列表页
 */
Crawler.prototype.isListUrl = function (url) {
    url = helper.formatUrl(url);
    return this._judge(url, 'list');
};
/**
 * 获取页面链接的唯一标示
 */
Crawler.prototype.getIdFromArticleUrl = function (url) {
    url = helper.formatUrl(url);
    var type = this._judge(url);
    return type ? this._getSourceId(url) : null;
};

module.exports = Crawler;
