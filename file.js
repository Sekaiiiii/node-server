/*
* author:谢奇
* create_day:2020-05-17
* modified_day:2020-05-17
* function:提供文件下载功能
*/
'use strict'
const express = require('express');
const fs = require('fs');
const path = require("path");
const router = express.Router();

router.get('/', function(req, res, next) {
    // 实现文件下载
    var fileName = req.query.fileName;
    var filePath = path.join(__dirname,"file", fileName);
    var stats = fs.statSync(filePath);
    if(stats.isFile()){
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename='+fileName,
        'Content-Length': stats.size
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.end(404);
    }
  });
module.exports = router;