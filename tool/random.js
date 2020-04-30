/*
 * author:谢奇
 * create_day:2020-04-30
 * modified_day:2020-04-30
 * function:生成随机数的相关封装
 */
'use strict'

module.exports = {
    randomNum: function (min, max) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * min + 1, 10);
                break;
            case 2:
                return parseInt(Math.random() * (max - min + 1) + min, 10);
                break;
            default:
                return 0;
                break;
        }
    }
};