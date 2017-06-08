'use strict'
var async = require('async'),
    cheerio = require('cheerio'),
    xpath = require('xpath'),
    dom = require('xmldom').DOMParser;
var helper = require('./helper');

/**
 * 解析器
 */
// jq解析器
var _jquerySelectorParser = function ($, item) {
    var data = '';
    item.selector.forEach(function (selector) {
        if (!item.format || item.format === 'text') {
            if (item.index !== undefined) {
                data = $(selector).eq(item.index).text().trim() || data;
            } else {
                data += $(selector).text() || '';
            }
        }
        if (item.format === 'meta') {
            if (item.index !== undefined) {
                data = $(selector).eq(item.index).attr('content') || data;
            } else {
                data += $(selector).attr('content') || '';
            }
        }
        if (item.format === 'count') {
            if (item.countType === 'image') {
                if (selector.indexOf(' img') > -1 || selector === 'img') {
                    data = +(data || 0) + $(selector).length;
                } else {
                    data = +(data || 0) + $(selector).find('img').length || 0;
                }
            }
            if (item.countType === 'text') {
                var text = $(selector).text();
                text = text.replace(/\n[\s| | ]*\r/g, '\n').replace(/\n/img, '');
                data = +(data || 0) + text.length;
            }
        }
        if (item.format === 'html') {
            if (item.index !== undefined) {
                data = `${helper.rencode($(selector).eq(item.index).html() || data)}`;
            } else {
                // 处理图片
                if (selector.indexOf(' img') > -1 || selector === 'img') {
                    $(selector).each(function (_index) {
                        var value = $(this).attr('src');
                        if (value) {
                            data += `<img src=${value}/>`;
                        }
                    });
                } else {
                    $(selector).each(function (_index) {
                        var value = ($.html(this) || '').trim();
                        var regExpExplain = new RegExp('<!--[^>]+-->', 'img');
                        value = value.replace(regExpExplain, '');
                        data += `${helper.rencode(value)}`

                    });
                }
            }
        } 
    });
    return data;
};
// 上下文解析器
var _contextSelectorParser = function (body, item) {
    var data = '';
    if (item.selector.length !== 2) {
        return null;
    }
    var upIndex = body.indexOf(item.selector[0]);
    var downIndex = body.indexOf(item.selector[1]);

    if (upIndex < 0 || downIndex < 0) {
        return null;
    }
    data = body.substring(upIndex + item.selector[0].length, downIndex);
    return data;
};
// xpath解析器
var _xpathSelectorParser = function ($, item) {
    var data = '';
    item.selector.forEach(function (selector) {
        var nodes = xpath.select(selector, $.doc);
        if (nodes.length > 0) {
            data += nodes[0].textContent || '';
        }
    });
    return data;
};
/**
 * 补全链接
 */
var _completionUrl = function (url, options) {
    if (!url) { return null; }
    if (url.indexOf('javascript') !== -1) { return null; }
    if (url.substr(0, 4) !== 'http') {
        if (url.substr(0, 2) === '//') {
            url = options.domains.split('//')[0] + url;
        } else if (url.substr(0, 1) === '/') {
            url = url.substr(1);
            url = options.domains + url.replace(/^http(s)?:\/\//, '').replace(options.domains.replace(/^http(s)?:\/\//, ''), '');
        } else {
            if (url.substr(0, 2) === './') {
                url = url.substr(2);
                var arrUrl = options.url.split('/');
                arrUrl[arrUrl.length - 1] = url;
                url = arrUrl.join('/');
            } else {
                url = options.domains + url;
            }
        }
    }
    if (url.indexOf('#') !== -1) {
        url = url.split('#')[0];
    }
    url = url.trim();
    return url;
};
/**
 * 提取url
 */
var getUrls = function (bodyHtml, self) {
    var $ = cheerio.load(bodyHtml);
    var result = [];
    $('a').each(function (index) {
        var url = _completionUrl($(this).attr('href'), {
            domains: self.domains,
            url: self.url
        });
        if (!url) { return true; }
        self.listUrlRegexes.forEach(function (urlRegex) {
            if (urlRegex.test(url)) {
                result.push(url);
            }
        });
        self.contentUrlRegexes.forEach(function (urlRegex) {
            if (urlRegex.test(url)) {
                result.push(url);
            }
        });
    });
    // 回调函数
    if (self.afterExtractUrls) {
        result = self.afterExtractUrls(result);
    }
    // 去重
    return helper.deDuplication(result);
};
/**
 * 提取数据
 */
var getFields = function (bodyHtml, self) {
    var $ = cheerio.load(bodyHtml);
    $.doc = new dom({
        errorHandler: {
            warning   : function (err) {},
            error     : function (err) {},
            fatalError: function (err) {}
        }
    }).parseFromString($.html());
    // 对图片链接进行处理
    $('img').each(function (item) {
        var url = _completionUrl($(this).attr('src'), {
            domains: self.domains,
            url: self.url
        });
        if (!url) { return true; }
        if (url.substr(0, 4) !== 'http') {
            $(this).attr('src', url);
        }
    });

    var result = {};
    self.fields.forEach(function (item) {
        result[item.name] = '';
        // 解析
        if (!item.meta.type || item.meta.type === 'jq' || item.meta.type === '$' || item.meta.type === 'jquery') {
            result[item.name] = _jquerySelectorParser($, item.meta);
        } else if (item.meta.type === 'context') {
            result[item.name] = _contextSelectorParser(body, item.meta);
        }
        // 处理默认
        if (!result[item.name] && item.defaultValue !== undefined) {
            result[item.name] = item.defaultValue;
        }
        // 处理翻译
        if (typeof result[item.name] === 'string' && self.i18n) {
            result[item.name] = helper.translate(result[item.name], self.i18n);
        }
        // 去掉首尾空格
        if (typeof result[item.name] === 'string') {
            result[item.name] = result[item.name].trim();
        }
        // 处理回调
        if (self.afterExtractField) {
            result[item.name] = self.afterExtractField(item.name, result[item.name]);
        }
        // 处理必填
        if (item.required && (result[item.name] === undefined || result[item.name] === '')) {
            console.error('fields[', item.name, '] value is emtly');
            throw new Error('fields value is emtly');
        }
    });
    return result;
};
/**
 * 根据选择器获取数据
 */
var getFieldsBySelector = function (bodyHtml, fields) {
    var $ = cheerio.load(bodyHtml);
    var result = {};
    fields.forEach(function (item) {
        result[item.name] = _jquerySelectorParser($, item.meta);
        if (!result[item.name] && item.defaultValue !== undefined) {
            result[item.name] = item.defaultValue;
        }
    });
    return result;
};
/**
 * 附加数据
 */
var getAttachUrl = function (options, callback) {
    if (!options.meta || !options.meta.length) {
        return callback(null, options.url);
    }
    var $ = cheerio.load(options.body);
    options.meta.forEach(function (item) {
        var value = null
        if (item.format === 'value') {
            value = $(item.selector).val();
        } else {
            value = $(item.selector).text();
        }
        options.url = options.url.replace(`{{${item.name}}}`, value);
    });
    callback(null, options.url);  
};
/**
 * 下一页
 */
var getContentPage = function (self, options, callback) {
    if (!options.url || !options.body) {
        return callback(null, null);
    }
    if (!self.contentPage || !self.contentPage.urls || !self.contentPage.selector) {
        return callback(null, null);
    }
    var $ = cheerio.load(options.body);
    var urls = [];
    $('a').each(function (item) {
        var url = _completionUrl($(this).attr('href'), {
            domains: self.domains,
            url: self.url
        });
        if (!url) { return true; }
        self.contentPage.urls.forEach(function (urlRegex) {
            if (urlRegex.test(url)) {
                urls.push(url);
            }
        });
    });
    // 数组去重
    urls = helper.deDuplication(urls);
    if (!urls.length) {
        return callback(null, null);
    }
    var regExpExplain = new RegExp('<!--[^>]+-->', 'img');
    var data = '';
    // 如果数组有数据 则拼接数据到指定位置
    async.mapSeries(urls, function (url, done) {
        helper.request(url, {
            format: self.format,
            charset: self.charset,
            userAgent: self.userAgent
        }, function (error, body) {
            var _$ = cheerio.load(body);
            self.contentPage.selector.forEach(function (selector) {
                _$(selector).each(function (_index) {
                    var value = ($.html(this) || '').trim();
                    value = value.replace(regExpExplain, '');
                    data += `${helper.rencode(value)}`;
                });
            });
            done(error, null);
        });
    }, function (err, result) {
        if (self.contentPage.prependNode) {
            $(self.contentPage.prependNode).prepend(data);
        }
        if (self.contentPage.appendNode) {
            $(self.contentPage.appendNode).append(data);
        }
        callback(err, $.html());
    });
};
module.exports = {
    // 提取url
    getUrls: getUrls,
    // 提取数据
    getFields: getFields,
    // 下一页
    getContentPage: getContentPage,
    // 附加数据
    getAttachUrl: getAttachUrl,
    // 根据选择器获取数据
    getFieldsBySelector: getFieldsBySelector
};
