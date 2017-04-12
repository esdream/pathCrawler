"use strict";
const fs = require('fs');
const readLineStream = require('lei-stream').readLine;
const writeLineStream = require('lei-stream').writeLine;

// 创建社区数据文件读取流
const readStreamOfOri = readLineStream(fs.createReadStream('./data_sources/CommPt_test.txt'), {
    newline: '\n',
    autoNext: false
});

// 创建医院数据文件读取流
const readStreamOfDes = readLineStream(fs.createReadStream('./data_sources/hospital_test.txt'), {
    newline: '\n',
    autoNext: false
});

let comOfOriAndDes = () => {
    let colOfOrigins = [],
        colOfDestinations = [],
        colOfCombinations = [],
        num = 0;
    readStreamOfOri.on('data', (data) => {
        let elements = data.split('\t');
        let origin = {
            address: elements[0],
            lng: elements[1],
            lat: elements[2]
        };
        colOfOrigins.push(origin);
        readStreamOfOri.next();
    });

    readStreamOfDes.on('data', (data) => {
        let elements = data.split('\t');
        let destination = {
            hosName: elements[0],
            lng: elements[1],
            lat: elements[2]
        };
        colOfDestinations.push(destination);
        readStreamOfDes.next();
    });

    readStreamOfOri.on('end', () => {
        console.log('起点数据读取完成');
        readStreamOfDes.on('end', () => {
            console.log('终点数据读取完成');
            let lengthOfOrigins = colOfOrigins.length,
                lengthOfDestinations = colOfDestinations.length,
                count = 0;
            let writeStream;
            for(let i = 1; i < lengthOfOrigins; i++) {
                for(let j = 1; j < lengthOfDestinations; j++) {
                    if(count % 10000 === 0) {
                        let fileNum = count / 10000 + 1;
                        let fileName = `./combination_files/combination${fileNum}.txt`;
                        // console.log(fileName);

                        writeStream = writeLineStream(fs.createWriteStream(fileName), {
                            newline: '\n',
                            cacheLines: 0
                        });
                    }
                    let combination = `${i},${j},${colOfOrigins[i].lat},${colOfOrigins[i].lng},${colOfDestinations[j].lat},${colOfDestinations[j].lng}`;
                    let string = combination.replace(/\r/g, "");
                    // console.log(string);

                    writeStream.write(string, () => {

                    });
                    count ++;
                }
            }

            writeStream.on('end', () => {
                console.log('写入完成');
            });
        });
    });
};
comOfOriAndDes();
