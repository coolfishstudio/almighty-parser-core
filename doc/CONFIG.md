## 配置参数

针对不同 要有自己定义的配置

注意 目前只支持html静态页的内容抓取

配置 | 描述 | 是否必填 | 类型
------------- | ------------- | ------------- | -------------
domains | 网站域名 | 必填 | 字符串
listUrlRegexes | 列表页url的正则，符合这些正则的页面会被当作列表页处理 | 必填 | 数组
contentUrlRegexes | 内容页url的正则，符合这些正则的页面会被当作内容页处理 | 必填 | 数组
fields | 从内容页中抽取需要的数据 | 必填 | fields示例
userAgent | 是否模拟用户请求 | 选填 | 字符串
charset | 编码 默认utf-8 | 选填 | 字符串
afterExtractField | 回调函数 对每一个抽取出来的数据进行处理 | 选填 | 方法
afterExtractAll | 回调函数 对所有抽取出来的数据进行处理 | 选填 | 方法
contentPage | 对详情页下一页内容处理 | 选填 | contentPage示例

## fields示例
字段 | 描述 | 类型
------------- | ------------- | -------------
name | 定义字段名字 | 字符串 必填
meta | 选择器 | meta示例 必填
defaultValue | 默认值 | 任意 选填

###  meta示例
字段 | 描述 | 类型
selector | 选择器(支持多个拼接) | 数组 必填
format | 返回是否含有标签[text/html/meta 默认text] | 字符串 选填
index | 下标 | 数字 选填

## contentPage示例
字段 | 描述 | 类型
------------- | ------------- | -------------
urls | 下一页的正则 | 数组 必填
selector | 选择器 | 数组 必填
appendNode | 插入的位置 | 任意 必填