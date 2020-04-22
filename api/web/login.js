/*
* author:谢奇
* create_day:2020-04-20
* modified_day:2020-04-20
* function:web端管理员登录
*/
"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const pool = require("../../tool/pool.js");

const router = express.Router();

router.use(bodyParser.urlencoded());
router.use(bodyParser.json());

router.post("/",function(req,res){
    console.log("Hello world!");
    pool.query("select * from role",function(err,data,fileds){
        if(err){
            console.error(err);
            return;
        }
        res.send({
            'data':data
        })
    })
})

module.exports = router;