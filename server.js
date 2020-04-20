/*
* author:谢奇
* create_day:2020-04-20
* modified_day:2020-04-20
* function:配置服务器监听端口，全局中间件。
*/

"use strict"

const express = require("express");


//创建app实例
const app = express();

//设置app监听端口
app.listen(8888,function(){
    console.log("在80端口已经打开服务器");
})

app.all("/",function(req,res){
    console.log(req);
    console.log(res);
    res.send("Hello world");
})