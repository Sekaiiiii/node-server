/*
* author:谢奇
* create_day:2020-04-25
* modified_day:2020-04-25
* function:获取new列表
*/
'use strict'
const express = require('express');
const router = express.Router();
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');

router.get("/",verify_login);
router.get("/",function(req,res){
    var sql = "select * from new";
    pool.query(sql,function(err,new_list,fileds){
        if(err){
            console.error(err);
            return;
        }
        res.send(return_obj.success({
            msg:"获取数据成功",
            data:new_list
        }));
    })

})

module.exports = router;