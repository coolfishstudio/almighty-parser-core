'use strict';
const Crawler = require('../../index.js')
const options = require('../parser/parser-healthno1.js')
const parser = new Crawler(options)

// const url = 'http://www.healthno1.com/'
// const url = 'http://www.healthno1.com/feature_articles.html?start=12'
// const url = 'http://www.healthno1.com/feature_articles.html'
// const url = 'http://www.healthno1.com/health_info/16841-2017-05-12-03-10-00.html'
const url = 'http://www.healthno1.com/16939-2017-05-19-10-16-00.html'

let errorItems = []

// 测试获取内容
async function testParseDate () {
    try {
        const result = await parser.parse(url)
        console.log('获取数据内容为', result)
    } catch (e) {
        console.error('[抓取数据出错]', e.message)
        errorItems.push('testParseDate')
    }
}
// 检测链接是否是详情页
function testIsArticleUrl () {
    try {
        const result = parser.isArticleUrl(url)
        console.log('获取数据内容为', result)
    } catch (e) {
        console.error('[抓取数据出错]', e.message)
        errorItems.push('testIsArticleUrl')
    }
}
// 测试页面链接的唯一标示
function testGetIdFromArticleUrl () {
    try {
        const result = parser.getIdFromArticleUrl(url)
        console.log('获取数据内容为', result)
    } catch (e) {
        console.error('[抓取数据出错]', e.message)
        errorItems.push('testGetIdFromArticleUrl')
    }
}

// 获取详情页内容
async function testGetContent () {
    try {
        const result = await parser.getContent(url)
        console.log('获取数据内容为', result)
    } catch (e) {
        console.error('[抓取数据出错]', e.message)
        errorItems.push('testGetContent')
    }
}

// 获取详情页内容
async function testGetLinks () {
    try {
        const result = await parser.getLinks(url)
        console.log('获取数据内容为', result)
    } catch (e) {
        console.error('[抓取数据出错]', e.message)
        errorItems.push('testGetLinks')
    }
}

// 测试入口
async function start () {
    console.log('测试开始')
    console.log('－－－－－－')
    console.log('测试步骤1 获取内容')
    await testParseDate()
    console.log('测试步骤1 获取内容 结束')
    console.log('－－－－－－')
    console.log('测试步骤2 校验链接是否为详情页')
    testIsArticleUrl()
    console.log('测试步骤2 校验链接是否为详情页 结束')
    console.log('－－－－－－')
    console.log('测试步骤3 获取页面链接的唯一标示')
    testGetIdFromArticleUrl()
    console.log('测试步骤3 获取页面链接的唯一标示 结束')
    console.log('－－－－－－')
    console.log('测试步骤4 获取详情页内容')
    // await testGetContent()
    console.log('测试步骤4 获取详情页内容 结束')
    console.log('－－－－－－')
    console.log('测试步骤5 获取列表页内容')
    // await testGetLinks()
    console.log('测试步骤5 获取列表页内容 结束')
    console.log('－－－－－－')
    console.log('所有接口均已测试结束')
    if (errorItems.length) {
        console.log('测试结果: ', errorItems.join(','), '异常。')
    } else {
        console.log('测试结果: 所有接口都正常。')
    }
}
start()
