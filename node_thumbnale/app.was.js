const express = require("express");
var bodyParser = require('body-parser');
var ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const fs = require("fs").promises;



let corsOption = {
    origin: '*',// 허락하는 요청 주소
    credentials: true // true하면 프론트에 쿠키를 공유할수있게된다.
}

let port = 19903;

if (typeof config == undefined || typeof config == "undefined" || config == null || config == "") {
} else {
    port = config.port;
}

let app = express();
app.use(cors(corsOption));
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

let server = app.listen(port, () => {
    console.log(port, "번 포트로 실행중!");
})

app.get("*", (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post("*", async (req, res) => {
    console.log("post 오긴옴");
    ffmpeg(__dirname + '/path/sample.mp4')
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
            count: 14,
            folder: __dirname+'/path'
        });
        // .screenshots({
        //     timestamps: ['50%', '75%'],
        //     filename: 'thumbnail-at-%s-seconds.png',
        //     folder: __dirname + '/path/output',
        //     size: '320x240',
        //     count: 1
        // });

    // let filename = './path/output/thumbnail.png';
    // fs.readFile(filename,
    //     (err, data) => {
    //         res.writeHead(200, { "Content-Type": "image/png" });
    //         res.write(data);
    //         res.end();
    //     }
    // )

    let filename = [];
    for (let i = 1; i <= 10; i++) {
        filename.push(`./path/tn_${i}.png`)
    }
    console.log(filename);
    res.writeHead(200, { "Content-Type": "image/png" });
    let qObj = [];
    
    for await (let [i, file] of filename.entries()) {
        fs.readFile(file,
            (err, data) => {
                console.log(i,"되곤있나?");
                console.log(data);
                qObj.push(data.toString())
                console.log("write쏨",file);
                return i;
            }
        ).then(res=>console.log(i))
    }

    console.log("qObj : ", qObj);

    setTimeout(() => {
        console.log("res 종료");
        // console.log(qObj);
        res.end()
    },5000)

})

