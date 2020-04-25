const express = require('express');
const router = express.Router();
const pool = require('../../tool/pool.js');
const verify_login = require('../../middleware/verify_login.js')
const verify_no_login = require('../../middleware/verify_no_login.js');
const return_obj = require('../../tool/return_obj.js');
sql = "select * from new";
    pool.query(sql,function(err,new_list,fileds){
        if(err){
            console.error(err);
            return;
        }
        console.log(new_list)
    })