const express = require("express");
const url = require("url");
const config = require("./config.json");
const axios = require("axios");
var bodyParser = require('body-parser')
const cors = require('cors');
const { randomUUID } = require('crypto')


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

let server = app.listen(port, () => {
    console.log(port, "번 포트로 실행중!");
})

// app.get("/list", async (req, res) => {
//     let qObj = reqURL.query;
//     getList(req, res, qObj);
//     return;
// })

// function getList(req, res, qObj) {
//     let url = config.baseURL + config.getList;
//     const auth = config.elastic.id + ":" + config.elastic.password;
//     let authorization = Buffer.from(auth, "utf8").toString("base64");
//     let jsonData = {
//         "from": "0",
//         "size": "40",
//         "track_total_hits": true
//     }

//     let postData = JSON.stringify(jsonData);

//     let options = {
//         url: url,
//         method: 'POST',
//         headers: {
//             Authorization: 'Basic ' + authorization,
//             'Content-Type': 'application/json'
//         },
//         data: postData
//     };

//     axios(options)
//         .then((response) => {
//             let jsonData = [];
//             response.data.hits.hits.forEach((v) => {
//                 let date = v._source.date.split('-');
//                 let parseDate = [];
//                 parseDate.push(date[0])
//                 parseDate.push("년 ")
//                 parseDate.push(date[1])
//                 parseDate.push("월 ")
//                 parseDate.push(date[2].split('T')[0])
//                 parseDate.push("일 ")
//                 parseDate.push(date[2].split('T')[1].split('.')[0])

//                 let data = {
//                     "id": v._id,
//                     "title": v._source.title,
//                     "writer": v._source.writer,
//                     "date": parseDate.join(""),
//                     "content": v._source.content
//                 }
//                 jsonData.push(data);
//             });

//             res.end(JSON.stringify(jsonData));
//             return;
//         })
//         .catch(err => {
//             console.log(err);
//         })
// }

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
            setTimeout(()=>{
                const acl = response.data;
                res.end()
                return;
            },1500)
           
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

app.get("/search",async (req,res) =>{
    searchArticle(req,res);
    return
})

function searchArticle(req,res) {
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
            response.data.hits.hits.forEach((v,index) => {
                let date = v._source.date.split('-')||'';
                let parseDate = [];
                console.log(date,index);
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




