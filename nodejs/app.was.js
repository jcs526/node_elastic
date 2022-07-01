const express = require("express");
const url = require("url");
const config = require("./config.json");
const axios = require("axios")
const request = require("request");
var port = 19901;

if (typeof config == undefined || typeof config == "undefined" || config == null || config == "") {
} else {
    port = config.port;
}
var app = express();

var server = app.listen(port, function () {
    console.log("Express server has started on port " + port);

    //   test();
});

app.get("*", async (req, res) => {
    res.header("Access-Control-Allow-Origin","*")
    var reqUrl = url.parse(req.url, true);
    console.log("reqUrl:", reqUrl);
    var qObj = reqUrl.query; // 일반적인 사용
    // res.end("123");
    login(req, res, qObj);
    return;
});

function login(req, res, qObj) {
    let url = config.elastic.url;
    console.log("url:", url);
    const auth = config.elastic.user + ":" + config.elastic.password;
    var authorization = Buffer.from(auth, "utf8").toString("base64");
    let jsonData = {
        "track_total_hits": true
    };
    let postData = JSON.stringify(jsonData);
    console.log("postData : ", postData);

    var options = {
        url: url,
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + authorization,
            'Content-Type': 'application/json'
        },
        body: postData
    };

    request(options, function (error, response, body) {
        if (response.statusCode == 200) {
            var data = JSON.parse(body);
            console.log("data:", data);
            res.end(JSON.stringify(data));
            //weekly_drawData(req, res, qObj, data);
        } else {
            //util.writeError({ result: false, description: error.message }, res);
        }
    }, res, qObj, config)

    // axios({
    //     method: "GET",
    //     url: url,
    //     headers: {
    //         Authorization: 'Basic ' + authorization,
    //         'Content-Type': 'application/json'
    //     },
    //     body: postData,
    // })
    //     .then(function (response) {
    //         const acl = response.data;
    //         console.log("acl:", acl);
    //         res.end(JSON.stringify(acl));
    //         return;
    //     })


}

app.post("*", async (req, res) => {
    console.log("post 들어옴");
    var body = [];
    var qObj = {};
    req.on("error", function (err) {
        console.log("[REQUEST_BODY-ERROR] " + err);
    })
        .on("data", function (chunk) {
            //chunk : postdata
            body.push(chunk);
        })
        .on("end", function (chunk) {
            var postData = body.toString();
            req.rawBody = postData;
            //util.msgbox("=============================================================================:::::", req.body)
            //util.msgfile2("app.post.data", JSON.stringify(req.body.title))
            //console.log("===========POST==============");
            //console.log(postData);
            var isParseError = false;
            try {
                qObj = JSON.parse(postData);
                //isParseError = true;
            } catch (e) {
                console.error(
                    "POST DATA is NOT JSON Format." + postData,
                    "->JSON으로 변환시도..."
                );
                // var logDir = getDir(config);
                // var logFilePath = logDir + "/" + util.getRandom() + ".req"; //filename setting
                // fs.writeFile(logFilePath, postData, function (err) { });
                isParseError = true;
            }
            if (isParseError) {
                qObj = {};
                var arr = postData.split("&");
                // x=1&y=2&z=3 => [0] x=1 [1] y=2 [2] z=3
                for (var index = 0; index < arr.length; index++) {
                    //console.log(arr[index]);
                    if (arr[index].indexOf("=") > 0) {
                        var key = util.strLeft(arr[index], "=");
                        var val = util.strRight(arr[index], "=");
                        val = val.replace(/%20/gi, "&");
                        if (val.indexOf(";") != -1) {
                            //for array
                            var arr = val.split(";");
                            var newArr = [];
                            for (var index = 0; index < arr.length; index++) {
                                newArr.push(arr[index].trim());
                            }
                            qObj[key] = newArr;
                        } else {
                            qObj[key] = val;
                        }
                    } else {
                        var key = arr[index];
                        qObj[key] = "";
                    }
                }
                console.info(
                    "POST DATA is NOT JSON Format." + postData,
                    "->JSON으로 변환결과:",
                    qObj
                );
            }

            //console.log(util.getTimeStamp() + " " + "POST..." + req.url);
            //console.log("qObj", qObj);
            //var reqUrl = url.parse(req.url, true);
            //var qObj = req.body; // 일반적인 사용

            // login(req, res, qObj);
            console.log(qObj);
            res.end(JSON.stringify(qObj));
            return;
        });
});