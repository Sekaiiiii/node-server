/*
* author:谢奇
* create_day:2020-04-24
* modified_day:2020-04-24
* function:nodejs session配置文件
*/
"use strict"
module.exports = {
    secret: 'secret',
    resave: 'true',
    saveUninitialized: false,
    cookie:{
        maxAge:1000*60*60*24*14
    }
}