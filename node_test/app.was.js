const express = require("express");
const url = require("url");
const multer = require("multer");
const formidable = require("formidable");
const morgan = require("morgan");


const config = require("./config.json");
const axios = require("axios");
const cors = require('cors');
const { randomUUID } = require('crypto')
var ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const path = require('path');
const Excel = require('exceljs');
const e = require("express");


const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)// 파일 원본이름 저장
    }
})

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.fileName + '-' + req.body.chunkCounter + '-' + req.body.uuid + '-' + file.originalname)// 파일 원본이름 저장
    }
})

const upload = multer({ storage: storage }); // 미들웨어 생성
const upload2 = multer({ storage: storage2 }); // 미들웨어 생성


let corsOption = {
    origin: '*',// 허락하는 요청 주소
    credentials: true // true하면 프론트에 쿠키를 공유할수있게된다.
}

let port;

if (typeof config == undefined || typeof config == "undefined" || config == null || config == "") {
} else {
    port = config.port;
}

let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOption));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(morgan("tiny"))

let server = app.listen(port, () => {
    console.log(port, "번 포트로 실행중!");
})

app.post("/write", async (req, res) => {
    writeArticle(req, res);
    return;
})

function writeArticle(req, res) {
    let url;
    if (req.body.uuid) {
        url = config.baseURL + config.write + req.body.uuid
    } else {
        url = config.baseURL + config.write + randomUUID();
    }
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

app.post("/select", async (req, res) => {
    selectArticle(req, res);
    return
})

function selectArticle(req, res) {
    let url = config.baseURL + config.getList
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "_id": req.body.id
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

app.get("/video/:id", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Rang Header");
    }
    const videoPath = __dirname + `/uploads/output/${req.params.id}.mp4`
    const videoSize = fs.statSync(__dirname + `/uploads/output/${req.params.id}.mp4`).size;

    const CHUNK_SIZE = 10 ** 6 * 2;
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
    for (let i = 1; i <= 10; i++) {
        if (i != req.params.number) {
            let filePath = __dirname + `/public/thumbnail/tn_${i}.png`;
            fs.unlinkSync(filePath);
        }
    }
    res.end();
})

app.post("/thumbnail", async (req, res) => {
    // ffmpeg(__dirname + '/public/video/sample.mp4')
    //     .on('filenames', function (filenames) {
    //         console.log("전");
    //         console.log('Will generate ' + filenames.join(', '))
    //         console.log("후");
    //     })
    //     .on('end', function () {
    //         console.log('Screenshots taken');
    //         res.end()
    //     })
    //     .screenshots({
    //         // Will take screens at 20%, 40%, 60% and 80% of the video
    //         count: 10,
    //         folder: __dirname + '/public/thumbnail',
    //         size: '320x?'
    //     });
    const count = 5;
    const timestamps = [];
    const startPositionPercent = 5;
    const endPositionPercent = 95;
    const addPercent = (endPositionPercent - startPositionPercent) / (count - 1);
    let i = 0;

    if (!timestamps.length) {
        let i = 0;
        while (i < count) {
            timestamps.push(`${startPositionPercent + addPercent * i}%`);
            i = i + 1;
        }
    }

    takeScreenshots(__dirname + '/uploads/output/af704387-8484-4d93-9be2-036f4545da97.mp4')

    function takeScreenshots(file) {
        ffmpeg(file)
            .on("start", () => {
                if (i < 1) {
                    console.log(`start taking screenshots`);
                }
            })
            .on("end", () => {
                i = i + 1;
                console.log(`taken screenshot: ${i}`);

                if (i < count) {
                    takeScreenshots(file);
                }
            })
            .screenshots({
                count: 1,
                timemarks: [timestamps[i]],
                filename: `%b-${i + 1}.jpg`
            }, path.join(path.dirname(file), `screenshots`));
    }

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
    ffmpeg(__dirname + '/public/video/sample.mp4')
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
        })
        .on('end', function () {
            console.log('Screenshots taken');
            res.end()
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

})

app.post("/stream", (req, res) => {
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

app.put("/userUpdate", (req, res) => {
    let url = config.baseURL + config.stream2 + req.body.videoId;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "currentTime": req.body.currentTime,
        "maxTime": req.body.maxTime,
        "complete": req.body.complete,
        "userId": req.body.userId,
        "videoId": req.body.videoId
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

app.get("/userInfo", (req, res) => {
    let url = config.baseURL + config.getStream2;
    const auth = config.elastic.id + ":" + config.elastic.password;
    let authorization = Buffer.from(auth, "utf8").toString("base64");
    let searchKey = req.query.selectOption;
    let jsonData = {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "userId": req.query.userId
                        }
                    }
                ]
            }
        }
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
            console.log("v는", v._id);
            console.log(worksheet);
            worksheet.addRow({
                id: `${v._id}`,
                currentTime: `${v._source.currentTime}`,
                maxTime: `${v._source.maxTime}`,
                complete: `${v._source.complete}`
            });
        }))
        .then(res => {
            workbook.xlsx.writeFile('export.xlsx');
            console.log("1번완료");
        })
        .catch(err => console.log(err))




    // save under export.xlsx




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

    // 주석이 있으면 window.open()으로 실행할시 다운가능
    // 없다면 zip파일이 다운로드 됨
    // 주석여부와 상관없이 blob 타입으로 처리는 가능
    res.writeHead(200, {
        "Content-type": `application/octet-stream`,
        "Content-length": file.length,
        "Content-Disposition": `attachment; filename="export2.xlsx"`,
    });
    res.end(file);


    console.log("File is written");
    console.log();

})

let buffers = [];

app.post("/upload1", upload.single('file'), (req, res) => {
    // req.file에 업로드한 파일 존재
    buffers.splice(req.body.start, (req.body.end - req.body.start), req.file.buffer)
    // console.log(buffers.length);
    // console.log(req.body.chunkNumber);
    console.log(req.file.buffer);
    console.log(buffers.join(' '));
    if (req.body.chunkNumber == buffers.length) {
        setTimeout(() => {
            buffers.join('')
            let result = Buffer.concat(buffers);
            console.log(result);
            fs.writeFileSync('uploads/test.mp4', result, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("잘된듯?");
                }
            })
            buffers = [];
        }, 500)
        res.end();

    } else
        res.end();
});

// API Endpoint for uploading file
app.post("/api/upload", (req, res) => {
    const form = new formidable.IncomingForm();
    console.log(form);

    const uploadFolder = path.join(__dirname, "public", "files");

    form.multiples = true;
    form.uploadDir = uploadFolder;
    console.log(form);
});

const data = {};


app.post("/upload2", upload.single('file'), (req, res) => {
    data[`$${req.body.chunkCounter}`] = req.file.buffer
    let result = [];
    if (Object.keys(data).length == req.body.numberOfChunks
        // &&req.body.chunkCounter==req.body.numberOfChunks-1
    ) {
        for (let i = 1; i <= Object.keys(data).length; i++) {
            result.push(data[`$${i}`]);
        }
        let buffers = Buffer.concat(Object.values(result));;
        fs.writeFile('uploads/test.mp4', buffers, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("저장완료");
            }
        })
        res.end();
    } else {
        // if(writeStream.length===req.body.totalSize){
        //     writeStream.end()
        // }
        res.end();
    }
})

app.post("/upload3", upload2.single('file'), (req, res) => {

    res.end(req.body.chunkCounter);
})

app.post("/merge", upload.single('fileName'), (req, res) => {
    console.log(req.body);
    let ws = fs.createWriteStream(__dirname + `/uploads/output/${req.body.uuid}.mp4`);


    for (let i = 1; i <= req.body.numberOfChunks; i++) {
        let read = fs.readFileSync(__dirname + `/uploads/${req.body.fileName}-${i}-${req.body.uuid}-blob`)
        ws.write(read)
    }
    ws.end();
    for (let i = 1; i <= req.body.numberOfChunks; i++) {
        let s = fs.unlinkSync(__dirname + `/uploads/${req.body.fileName}-${i}-${req.body.uuid}-blob`
            // ,(err)=>{
            //     if(err){
            //         console.log(err);
            //     }else{
            //         console.log("삭제굿",i);
            //     }
            // }
        )
    }
    console.log("합체완성!!!");
    res.end("생성완료랍니다");
})

app.get('/comment', (req, res) => {
    orderList(req, res);
});

app.post('/comment', (req, res) => {
    console.log(req.body);
    let rs = fs.readFileSync('comment.json');

    let list = JSON.parse(rs);
    req.body.date = new Date();

    list.push(req.body)
    // console.log('list : ',list);
    let ws = fs.writeFileSync('comment.json', JSON.stringify(list))
    orderList(req, res);
})
app.post('/deleteComment', (req, res) => {
    console.log(req.body);
    let rs = fs.readFileSync('comment.json');

    let list = JSON.parse(rs);
    req.body.date = new Date();

    let processed = list.filter(v => {
        return v.uuid !== req.body.uuid
    })
    // console.log('list : ',list);
    let ws = fs.writeFileSync('comment.json', JSON.stringify(processed))
    orderList(req, res);
})

function orderList(req, res) {
    let rs = fs.readFileSync('comment.json');
    let disorder = JSON.parse(rs);
    let ordered = []


    function order(parent, depth) {
        disorder
            .filter((v) => {
                    return v.depth === depth && v.parent === parent;
            })
            // .sort((a, b) => {
            //     a.date - b.date;
            // })
            .forEach((v) => {
                ordered.push(v);
                order(v.uuid, depth + 1);
            });
    }
    order('main', 1)
    // console.log(ordered);
    res.end(JSON.stringify(ordered))
}