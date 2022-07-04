const express = require("express");
var ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
// const fs = require("fs").promises;
const fs = require("fs");
const path = require('path');



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
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, 'path')));

let server = app.listen(port, () => {
    console.log(port, "번 포트로 실행중!");
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get("/video", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Rang Header");
    }
    const videoPath = "sample.mp4"
    const videoSize = fs.statSync("sample.mp4").size;

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
            let filePath = __dirname + `/path/tn_${i}.png`;
            console.log(filePath);
            fs.unlinkSync(filePath);
        }
    }
    res.end();
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
            count: 10,
            folder: __dirname + '/path',
            size: '320x?'
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

    // let filename = [];
    // for (let i = 1; i <= 10; i++) {
    //     filename.push(`./path/tn_${i}.png`)
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

    // console.log("qObj : ", qObj);

    setTimeout(() => {
        console.log("res 종료");
        // console.log(qObj);
        res.end()
    }, 5000)

})

