/*
 * author:Jeffrey
 * create_day:2020-05-21
 * modified_day:2020-05-21
 * function:开启爬虫
 */
'use strict'
const express = require('express');
const pool = require('../../tool/pool.js'); // mysql请求的库
const path = require("path");
const { exec } = require('child_process');

const router = express.Router();

//运行helloworld脚本

router.get("/start_server", function (req, res, next) {
    exec(path.join(__dirname, "..", "..", "shell", "scrapy_server.sh"), function (req, res, next) {
        if (err) {
            return res.send(err);
        }
        return res.send({
            stdout: stdout,
            stderr: stderr
        });
    });
})




router.get("/start_spider", function (req, res, next) {
    // if (req.query.startTime)
    //     command += `-d museum=${req.query.museum}`
    // if (req.query.startTime)
    //     command += `-d startTime=${req.query.startTime}`
    // if (req.query.endTime)
    //     command += `-d endTime=${req.query.endTime}`
    
    command = `${path.join(__dirname,"..","..","shell","spider.sh")} 
                 ${req.query.museum ? `${req.query.museum}` : "" } 
                 ${req.query.startTime ? `${req.query.startTime}` : "" }
                 ${req.query.endTime ? `${req.query.endTime}` : "" }
            `;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            return res.send(err);
        }
        return res.send({
            stdout: stdout,
            stderr: stderr
        });

    })


});

//错误处理
router.use("/", function (err, req, res, next) {

})

module.exports = router;