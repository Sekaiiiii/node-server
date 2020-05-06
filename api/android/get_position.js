/*
* author:谢奇
* create_day:2020-05-02
* modified_day:2020-05-02
* function:提供给老田得测试position得接口
*/
'use strict'
const express = require('express');
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');

const router = express.Router();
router.get("/", function (req, res, next) {
    let sql = "select * from position";
    pool.query(sql, (err, data, fileds) => {
        if (err) {
            console.error(err);
            return res.send(return_obj.fail("200", "调用数据库接口发生异常错误"));
        }
        res.send(return_obj.success({
            "position_list": data
        }));
    })
})




module.exports = router;