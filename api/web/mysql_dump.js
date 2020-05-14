/*
* author:谢奇
* create_day:2020-05-14
* modified_day:2020-05-14
* function:
*/
'use strict'
const express = require('express');
const exec = require("child_process");
const path = require("path");

const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
const router = express.Router();

//验证登录
router.get("/", verify_login);

router.use("/", function (req, res) {
    exec(path.join(__dirname , "..","..","shell","db_dump.sh"),(err,stdout,stderr)=>{
        if(err){
            return console.error(`执行错误 ${err}`);
        }
        console.log(stdout);
    })
})

module.exports = router;