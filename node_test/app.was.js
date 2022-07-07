const express = require("express");
const url = require("url");
const config = require("./config.json");
const axios = require("axios");
var bodyParser = require('body-parser')
const cors = require('cors');
const { randomUUID } = require('crypto')
var ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const path = require('path');
const Excel = require('exceljs');

const workbook = new Excel.Workbook();

let corsOption = {
    origin: 'http://localhost:8080',// 허락하는 요청 주소
    credentials: true // true하면 프론트에 쿠키를 공유할수있게된다.
}

let port;

if (typeof config == undefined || typeof config == "undefined" || config == null || config == "") {
} else {
    port = config.port;
}

let app = express();
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use('/', express.static(path.join(__dirname, 'public')));


let server = app.listen(port, () => {
    console.log(port, "번 포트로 실행중!");
})

app.post("/write", async (req, res) => {
    writeArticle(req, res);
    return;
})

function writeArticle(req, res) {
    let url = config.baseURL + config.write + randomUUID();
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");

    let jsonData = {
        "title": req.body.title,
        "content": req.body.content,
        "writer": req.body.writer,
        "date": req.body.date
    }
    let postData = JSON.stringify(jsonData);
    console.log(req.body);
    console.log(postData);

    let options = {
        url: url,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            setTimeout(() => {
                const acl = response.data;
                res.end()
                return;
            }, 1500)

        })
        .catch(err => console.log(err))
}

app.post("/delete", async (req, res) => {
    deleteArticle(req, res);
})

function deleteArticle(req, res) {
    let url = config.baseURL + config.delete;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");

    let jsonData = {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "_id": req.body.id
                        }
                    }
                ]
            }
        }
    }
    let postData = JSON.stringify(jsonData);

    let options = {
        url: url,
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then(
            res.end())
    return;
}


app.post("/modify", async (req, res) => {
    modifyArticle(req, res);
    return;
})

function modifyArticle(req, res) {
    let url = config.baseURL + config.write + req.body.id;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let jsonData = {
        "title": req.body.title,
        "content": req.body.content,
        "writer": req.body.writer,
        "date": req.body.date
    }
    let postData = JSON.stringify(jsonData);
    let options = {
        url: url,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            res.end()
            return;
        })
        .catch(err => console.log(err))
}

app.get("/search", async (req, res) => {
    searchArticle(req, res);
    return
})

function searchArticle(req, res) {
    let url = config.baseURL + config.getList;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "from": "0",
        "size": "40",
        "query": {
            "wildcard": {
                [`${req.query.selectOption}`]: `*${req.query.searchValue}*`
            }
        },
        "track_total_hits": true
    }
    let postData = JSON.stringify(jsonData);

    let options = {
        url: url,
        method: 'GET',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            let jsonData = [];
            response.data.hits.hits.forEach((v, index) => {
                let date = v._source.date.split('-') || '';
                let parseDate = [];
                console.log(date, index);
                parseDate.push(date[0])
                parseDate.push("년 ")
                parseDate.push(date[1])
                parseDate.push("월 ")
                parseDate.push(date[2].split('T')[0])
                parseDate.push("일 ")
                parseDate.push(date[2].split('T')[1].split('.')[0])

                let data = {
                    "id": v._id,
                    "title": v._source.title,
                    "writer": v._source.writer,
                    "date": parseDate.join(""),
                    "content": v._source.content
                }
                jsonData.push(data);
            });

            res.end(JSON.stringify(jsonData));
            return;
        })
        .catch(err => {
            console.log(err);
        })
}

app.get("/video", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Rang Header");
    }
    const videoPath = __dirname + "/public/video/sample.mp4"
    const videoSize = fs.statSync(__dirname + "/public/video/sample.mp4").size;

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.pipe(res);

})

app.get("/thumbnail/:number", (req, res) => {
    console.log(req.params.number);
    for (let i = 1; i <= 10; i++) {
        if (i != req.params.number) {
            let filePath = __dirname + `/public/thumbnail/tn_${i}.png`;
            console.log(filePath);
            fs.unlinkSync(filePath);
        }
    }
    res.end();
})

app.post("/thumbnail", async (req, res) => {
    console.log("post 오긴옴");
    ffmpeg(__dirname + '/public/video/sample.mp4')
        .on('filenames', function (filenames) {
            console.log("전");
            console.log('Will generate ' + filenames.join(', '))
            console.log("후");
        })
        .on('end', function () {
            console.log('Screenshots taken');
        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 10,
            folder: __dirname + '/public/thumbnail',
            size: '320x?'
        });
    // .screenshots({
    //     timestamps: ['50%', '75%'],
    //     filename: 'thumbnail-at-%s-seconds.png',
    //     folder: __dirname + '/public/video/output',
    //     size: '320x240',
    //     count: 1
    // });

    // let filename = './public/video/output/thumbnail.png';
    // fs.readFile(filename,
    //     (err, data) => {
    //         res.writeHead(200, { "Content-Type": "image/png" });
    //         res.write(data);
    //         res.end();
    //     }
    // )

    // let filename = [];
    // for (let i = 1; i <= 10; i++) {
    //     filename.push(`./public/video/tn_${i}.png`)
    // }
    // console.log(filename);
    // res.writeHead(200, { "Content-Type": "image/png" });
    // let qObj = [];

    // for await (let [i, file] of filename.entries()) {
    //     fs.readFile(file,
    //         (err, data) => {
    //             console.log(i,"되곤있나?");
    //             console.log(data);
    //             qObj.push(data.toString())
    //             console.log("write쏨",file);
    //             return i;
    //         }
    //     ).then(res=>console.log(i))
    // }
});

app.post("/thumbnail2", async (req, res) => {
    console.log("post 오긴옴");
    ffmpeg(__dirname + '/public/video/sample.mp4')
        .on('filenames', function (filenames) {
            console.log("전");
            console.log('Will generate ' + filenames.join(', '))
            console.log("후");
            console.log(req.body);
        })
        .on('end', function () {
            console.log('Screenshots taken');
        })
        // .screenshots({
        //     // Will take screens at 20%, 40%, 60% and 80% of the video
        //     count: 10,
        //     folder: __dirname + '/public/thumbnail',
        //     size: '320x?'
        // });
        .screenshots({
            timestamps: [`${req.body.timestamp}`],
            filename: req.body.name + '-at-%s-seconds.png',
            folder: __dirname + '/public/video/output',
            size: '320x?',
            count: 1
        });

    // setTimeout(() => {
    console.log("res 종료");
    // console.log(qObj);
    res.end()
    // }, 5000)


})

app.post("/stream", (req, res) => {
    console.log(req.body);
    let url = config.baseURL + config.stream + 123;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let jsonData = {
        "currentTime": req.body.currentTime,
        "complete": req.body.complete,
        "check": req.body.check,
    }
    let postData = JSON.stringify(jsonData);
    let options = {
        url: url,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            res.end()
            return;
        })
        .catch(err => console.log(err))
})

app.get("/stream", (req, res) => {
    console.log("왜안옴?");
    let url = config.baseURL + config.getStream;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "from": "0",
        "size": "1",
        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "_id": "123"
                        }
                    }
                ]
            }
        },
        "track_total_hits": true
    }
    let postData = JSON.stringify(jsonData);

    let options = {
        url: url,
        method: 'GET',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            console.log(response.data.hits.hits);
            let responseData = {
                id: response.data.hits.hits[0]._id,
                currentTime: response.data.hits.hits[0]._source.currnetTime,
                complete: response.data.hits.hits[0]._source.complete,
                check: response.data.hits.hits[0]._source.check,
            }
            let qObj = JSON.stringify(responseData);
            res.end(qObj)
        }
        ).catch(err => {
            console.log(err);
        })
})
app.post("/stream2", (req, res) => {
    console.log(req.body);
    let url = config.baseURL + config.stream2 + 123;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let jsonData = {
        "currentTime": req.body.currentTime,
        "complete": req.body.complete,
        "check": req.body.check,
    }
    let postData = JSON.stringify(jsonData);
    let options = {
        url: url,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            res.end()
            return;
        })
        .catch(err => console.log(err))
})

app.get("/stream2", (req, res) => {
    let url = config.baseURL + config.getStream2;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "from": "0",
        "size": "1",
        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "_id": "123"
                        }
                    }
                ]
            }
        },
        "track_total_hits": true
    }
    let postData = JSON.stringify(jsonData);

    let options = {
        url: url,
        method: 'GET',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then((response) => {
            console.log(response.data.hits.hits);
            let responseData = {
                id: response.data.hits.hits[0]._id,
                currentTime: response.data.hits.hits[0]._source.currentTime,
                maxTime: response.data.hits.hits[0]._source.maxTime,
                complete: response.data.hits.hits[0]._source.complete
            }
            let qObj = JSON.stringify(responseData);
            console.log("qobj", qObj);
            res.end(qObj)
        }
        ).catch(err => {
            console.log(err);
        })
})
app.put("/stream", (req, res) => {
    let url = config.baseURL + config.stream2 + 123;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "currentTime": req.body.currentTime,
        "maxTime": req.body.maxTime,
        "complete": req.body.complete
    }
    let postData = JSON.stringify(jsonData);
    console.log("postData", postData);

    let options = {
        url: url,
        method: 'PUT',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then(res.end())
})
app.delete("/stream", (req, res) => {
    let url = config.baseURL + config.deleteStream2
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "query": {
            "bool": {
                "must": [
                    {
                        "term": {
                            "_id": "123"
                        }
                    }
                ]
            }
        }
    }
    let postData = JSON.stringify(jsonData);
    console.log("postData", postData);

    let options = {
        url: url,
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    };

    axios(options)
        .then(res.end())
})

app.get("/excel/:id", async (req, res) => {

    let query =
    {
        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "_id": req.params.id
                        }
                    }
                ]
            }
        },
        "track_total_hits": true
    }

    let postData = JSON.stringify(query);
    let url = config.baseURL + config.getStream2;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");


    options = {
        url: url,
        method: 'GET',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        data: postData
    }

    

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    worksheet.columns = [
        { header: '아이디', key: 'id', width: 10 },
        { header: '현재시간', key: 'currentTime', width: 32 },
        { header: '진행현황', key: 'maxTime', width: 15, },
        { header: '수료현황', key: 'complete', width: 15, }
    ];

    axios(options)
        .then(res => res.data.hits.hits.forEach((v) => {
            console.log("Dd");
            worksheet.addRow({
                id: v._id,
                currentTime: v._source.currentTime,
                maxTime: v._source.maxTime,
                complete: v._source.complete
            });
        }))
        .catch(err => console.log(err))




    // save under export.xlsx
    await workbook.xlsx.writeFile('export.xlsx');
    console.log("1번완료");



    // load a copy of export.xlsx
    // const newWorkbook = new Excel.Workbook();
    // await newWorkbook.xlsx.readFile('export.xlsx');

    // const newworksheet = newWorkbook.getWorksheet('My Sheet');
    // console.log(newworksheet.getRow(4).getCell(2).value);
    // newworksheet.columns = [
    //     { header: 'Id11', key: 'id', width: 10 },
    //     { header: 'Name', key: 'name', width: 32 },
    //     { header: 'D.O.B.', key: 'dob', width: 15, }
    // ];
    // newworksheet.addRow({ id: 4, name: 'Jane Doe1', dob: new Date(1965, 1, 7) });
    // await newWorkbook.xlsx.writeFile('export2.xlsx');



    const file = fs.readFileSync('export.xlsx');
    res.writeHead(200, {
        "Content-type": `application/octet-stream`,
        "Content-length": file.length,
        "Content-Disposition": `attachment; filename="export2.xlsx"`,
    });
    res.end(file);


    console.log("File is written");
    console.log();

})


