"use strict";
const fs = require('fs');
const readLineStream = require('lei-stream').readLine;
const writeLineStream = require('lei-stream').writeLine;

// 创建社区数据文件读取流
const readStreamOfComm = readLineStream(fs.createReadStream('./dataSources/CommPt_utf8.txt'), {
    newline: '\n',
    autoNext: false
});

// 创建医院数据文件读取流
const readStreamOfHos = readLineStream(fs.createReadStream('./dataSources/hospital_utf8.txt'), {
    newline: '\n',
    autoNext: false
});

let comOfCommAndHos = () => {
    let colOfCommunities = [],
        colOfHospitals = [],
        colOfCombinations = [],
        num = 0;
    readStreamOfComm.on('data', (data) => {
        let elements = data.split('\t');
        let community = {
            address: elements[0],
            lng: elements[1],
            lat: elements[2]
        };
        colOfCommunities.push(community);
        readStreamOfComm.next();
    });

    readStreamOfHos.on('data', (data) => {
        let elements = data.split('\t');
        let hospital = {
            hosName: elements[0],
            lng: elements[2],
            lat: elements[3]
        };
        colOfHospitals.push(hospital);
        readStreamOfHos.next();
    });

    readStreamOfComm.on('end', () => {
        console.log('社区数据读取完成');
        readStreamOfHos.on('end', () => {
            console.log('医院数据读取完成');
            let lengthOfCommunities = colOfCommunities.length,
                lengthOfHospitals = colOfHospitals.length,
                count = 0;
            let writeStream;
            for(let i = 1; i < lengthOfCommunities; i++) {
                for(let j = 1; j < lengthOfHospitals; j++) {
                    if(count % 10000 === 0) {
                        let fileNum = count / 10000 + 1;
                        let fileName = `./combination/com${fileNum}.txt`;
                        // console.log(fileName);

                        writeStream = writeLineStream(fs.createWriteStream(fileName), {
                            newline: '\n',
                            cacheLines: 0
                        });
                    }
                    let combination = `${i},${j},${colOfCommunities[i].lat},${colOfCommunities[i].lng},${colOfHospitals[j].lat},${colOfHospitals[j].lng}`;
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
comOfCommAndHos();
