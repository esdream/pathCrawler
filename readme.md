---
title: Path Crawler（路径爬虫程序）使用手册
tags: crawler,爬虫,百度地图API
grammar_cjkRuby: true
---
### 运行环境与平台安装
1. 程序运行的操作系统：Windows 10（其他操作系统未进行测试，但只要能安装node.js的操作系统应该都可以运行）。
2. 安装**node.js**：访问 <a>https://nodejs.org/en/</a>，下载node.js最新版本，进行安装。node.js官网默认下载`.msi`格式安装包，在Windows上可以直接安装，在安装过程中注意将node添加到环境变量的选项是否选择（默认添加）。
3. 建议安装**git bash**: 访问 <a>https://git-for-windows.github.io/</a>，下载安装git for windows，安装后系统内会具有**git bash**工具，实测爬取效率高于power shell。使用方法详见后续具体程序操作步骤。
---

### 数据预处理
1. 将`.dbf`文件导出成`.txt`文件，以`\t(Tab)`为间隔，保留表头（可以在Excel中实现）。
2. 确保每一行数据对应每一个社区或者医院的信息。
3. 进行处理的文本数据必须是**utf-8**格式的，如果转换后的文本不是utf-8格式，可以用Windows的文本编辑器打开，点击“另存为”，选择编码为UTF-8，保存即可。
---

### 数据组合与切份
这一步骤的主要操作通过`combination.js`完成。
1. 程序第6-10行为读取社区源文件程序。可以修改`CommPt_utf8.txt`为需要读取的社区数据文件。
    ```js
    const readStreamOfComm = readLineStream(fs.createReadStream('./dataSources/CommPt_utf8.txt'), {
        newline: '\n',
        autoNext: false
    });
    ```
2. 程序第12-16行为读取医院源文件程序。可以修改`hospital_utf8.txt`为需要读取的医院数据文件。
    ```js
    const readStreamOfHos = readLineStream(fs.createReadStream('./dataSources/hospital_utf8.txt'), {
        newline: '\n',
        autoNext: false
    });
    ```
3. 社区数据和医院数据在读取时设置为逐行读取，每一行的数据读取后存储在`elements`数组中，elements数组下标n为这一行数据第n个属性值。程序第25-29行可以设置社区数据的属性下标。第37-39行可以设置医院的属性下标。对应关系如下表。
    |程序属性|文本数据属性名|
    |---|---|
    |address/hosName|社区地址/医院名|
    |lat|纬度|
    |lng|经度|
4. 在`combination.js`所在目录下右键，选择`git bash here`，打开后运行以下命令：
    ```bash
    node combination.js
    ```
5. 程序将按照数据在源文件中的行号进行编号，**由于数据源文件中首行为表头，因此第二行编号为1**。编号后进行组合并切片，按照顺序每10000对组合切片成一个文件，存储在**combination**文件夹中。切片文件名为`com+number.txt`，例如`com1.txt`。全部组合与切片完成后，程序会在控制台打印`写入完成`。
---

### 发送请求与存储数据
这一步骤通过**Read.js**完成。
1. 确认当前请求的**交通模式**。与交通模式相关的参数位于程序的**第62行**和**第89行**。可修改的交通模式包括**driving(驾车)、walking(步行)、transit(公交)、riding(骑行)**。每次爬取完一种交通模式下所有点相互间的通行路径后，再进行修改。
    ```js
    // 第62行
    qs: {
        mode: 'walking',    // 本行修改的是请求时的交通模式，>>**重要**<<
        ...
    }
    
    // 第89行
    let tranSchema = 'walking';     // 本行修改的是保存在数据中的交通模式
    ```
1. 修改组合文件和路径结果文件。在程序**第53行**。
    ```js
    pathAnalysis('./combination/com35.txt', './pathResult/path35.txt');
    ```
2. 修改ak。在程序**第68行**。
    ```js
    ak: 'dOaspTMmxaxRBGDHFApy8pdvnvCGzuX3'
    ```
3. 在`Read.js`所在目录下右键，选择`git bash here`，打开后运行以下命令：
    ```bash
    node Read.js
    ```
    程序立即开始运行。正常情况下，成功获取路径信息会打印在git bash界面上。当git bash界面上开始出现以下错误信息时，程序可能会卡住，此时并发量一般小于50。可以不必等待。直接**Ctrl + C**结束该任务运行。
    ```
    # 错误信息示例
    [SyntaxError: Unexpected token ILLEGAL]
    [SyntaxError: Unexpected token )]
    ```
4. 将 **`.\pathResult`** 文件夹中的结果文件**备份**。
5. 将`Read.js`文件所在目录下的 **`error.txt`** 文件备份，并修改名字为`error + num.txt`，与结果文件对应。
6. 重复以上步骤，直至所有切片文件爬取完成。
7. 将error文件夹中所有的`error + num.txt`文件合并，再次重复上述步骤，即可完成爬取。