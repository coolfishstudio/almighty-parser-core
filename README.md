# 页面解析核心
此工具适用于
1. 对单独页面链接进行解析
2. 配合队列进行多页面解析

## api接口
- [x] `getLinks` 获取待抓页链接
- [x] `getContent` 获取详情页内容
- [x] `parse` 解析获取内容[为`getLinks`与`getContent`的集合]
- [x] `isArticleUrl` 检测链接是否是详情页
- [x] `isListUrl` 检测链接是否是列表页
- [x] `getIdFromArticleUrl` 获取页面链接的唯一标示

## 配置参数

## 实例
### 定义网站规则
```
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
```

### 引入
```
const Crawler = require('almighty-parser-core')
const options = require('../parser/parser-qiushibaike.js')
const parser = new Crawler(options)
```

### API测试
#### parse
```
{ fields:
   { author: '草莓、牛奶巧克力',
     tags: [ '搞笑图片' ],
     keywords: '',
     description: '笑死我了',
     content: '<div class="content">\n\n笑死我了\n\n</div><div class="thumb">\n\n<img src="//pic.qiushibaike.com/system/pictures/11909/119095438/medium/app119095438.jpg" alt="糗事#119095438">\n\n</div>',
     imagesCount: 1,
     wordsCount: 4,
     comments: 0,
     likes: 457,
     from: 'https://www.qiushibaike.com/article/119095438',
     sourceId: 'com.qiushibaike.www-article-119095438',
     site: 'www.qiushibaike.com',
     hits: 0 },
  urls:
   [ 'https://www.qiushibaike.com/',
     'https://www.qiushibaike.com/hot/',
     'https://www.qiushibaike.com/imgrank/',
     'https://www.qiushibaike.com/text/',
     'https://www.qiushibaike.com/history/',
     'https://www.qiushibaike.com/pic/',
     'https://www.qiushibaike.com/textnew/',
     'https://www.qiushibaike.com/my',
     'https://www.qiushibaike.com/article/116423562',
     'https://www.qiushibaike.com/article/116424718',
     'https://www.qiushibaike.com/article/116421669',
     'https://www.qiushibaike.com/article/116423344',
     'https://www.qiushibaike.com/article/116426229',
     'https://www.qiushibaike.com/article/116423107',
     'https://www.qiushibaike.com/article/104614784',
     'https://www.qiushibaike.com/article/104590828',
     'https://www.qiushibaike.com/article/104629666',
     'https://www.qiushibaike.com/article/104599846',
     'https://www.qiushibaike.com/article/104598154',
     'https://www.qiushibaike.com/article/104619022',
     'https://www.qiushibaike.com/article/118954381',
     'https://www.qiushibaike.com/article/118491926',
     'https://www.qiushibaike.com/article/118563113',
     'https://www.qiushibaike.com/article/118806836',
     'https://www.qiushibaike.com/article/118525804',
     'https://www.qiushibaike.com/article/118770803',
     'https://www.qiushibaike.com/article/119008939',
     'https://www.qiushibaike.com/article/119033005',
     'https://www.qiushibaike.com/article/119036209',
     'https://www.qiushibaike.com/article/118922421',
     'https://www.qiushibaike.com/article/119014594',
     'https://www.qiushibaike.com/article/119009873',
     'https://www.qiushibaike.com/article/118934286',
     'https://www.qiushibaike.com/joke/',
     'https://www.qiushibaike.com/article/' ] }
```

其余接口测试请下载后运行
```
npm run test:qiushibaike
```
