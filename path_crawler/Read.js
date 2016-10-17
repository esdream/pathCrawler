"use strict";
const fs = require('fs');
const http = require('http');
const async = require('async');
const request = require('request');
const readLineStream = require('lei-stream').readLine;
const writeLineStream = require('lei-stream').writeLine;

// 创建写入流，error.txt是出现错误的组合的编号
let writeStreamError = writeLineStream(fs.createWriteStream('./error.txt'), {
    newline: '\n',
    cacheLines: 0
});

// 并发数
let concurrencyCount = 0;
// 个数
let num = 0;

// 路径分析主方法
let pathAnalysis = (readFileName, writeFileName) => {
    let readStream = readLineStream(fs.createReadStream(readFileName), {
        newline: '\n',
        autoNext: false
    });
    let writeStream = writeLineStream(fs.createWriteStream(writeFileName), {
        newline: '\n',
        cacheLines: 0
    });

    let colOfComs = [];
    readStream.on('data', (data) => {
        let elements = data.split(',');
        colOfComs.push(elements);
        readStream.next();
    });

    readStream.on('end', () => {
        console.log(`${readFileName}读取完成`);

        // 并发量设置为1000没有太大问题
        async.mapLimit(colOfComs, 200, function(elements, callback) {
            fetchUrl(writeStream, elements, callback);
        }, function(err, result) {

            // console.log(result);
        });
    });
};


// 运行前修改此处路径
pathAnalysis('./combination/combination35.txt', './pathResult/path35.txt');

// 爬取路径方法
let fetchUrl = (writeStream, elements, callback) => {
    concurrencyCount++;
    let options = {
        method: 'GET',
        url: 'http://api.map.baidu.com/direction/v1',
        qs: {
            mode: 'driving',
            origin: `${elements[2]},${elements[3]}`,
            destination: `${elements[4]},${elements[5]}`,
            origin_region: '南京',
            destination_region: '南京',
            output: 'json',
            ak: 'dOaspTMmxaxRBGDHFApy8pdvnvCGzuX3'
        },
        headers: {
            'cache-control': 'no-cache'
        }
    };
    request(options, function(error, response, body) {
        if(error) {
            console.log(error);
            let errorString = `${elements[0]},${elements[1]},${elements[2]},${elements[3]},${elements[4]},${elements[5]}`;
            writeStreamError.write(errorString, () => {

            });
        }
        try {
            num++;
            let naviObj = eval('(' + body + ')');

            console.log(naviObj);
            let kiloDistance = 0;  // 里程(千米)
            let secTime = 0;    // 时间(s)
            let tranSchema = 'Driving';     // 交通模式，根据发送请求时的mode参数决定
            let paths = '';
            for(let route of naviObj.result.routes) {
                kiloDistance += route.distance / 1000;
                secTime += route.duration;
                for(let step of route.steps) {
                    paths += step.path;
                }
            }
            // elements[0]为numOfCommunity, elements[1]为numOfHospital
            let PathData = `${elements[0]}\t${elements[1]}\t${num}\t${secTime}\t${kiloDistance}\t${tranSchema}\t${paths}`;
            writeStream.write(PathData, () => {
            });
        } catch(error) {
            console.log(error);
            let errorString = `${elements[0]},${elements[1]},${elements[2]},${elements[3]},${elements[4]},${elements[5]}`;
            writeStreamError.write(errorString, () => {

            });
            // writeStreamError.write(`${elements[0]}, ${elements[1]}`, () => {
            //
            // });
        }

        concurrencyCount--;
        console.log(`现在的并发数是${concurrencyCount}`);
        callback(null, `${elements[0]}, ${elements[1]} get!`);
    });
};
