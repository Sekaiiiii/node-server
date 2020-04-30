const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host:'smtp.163.com',
    port:'465',
    secure:true,
    auth: {
        user: 'sekaiiiii@163.com',
        pass: 'TLFNXYDXGMLOHFVQ'
    }
});

transporter.verify(function(error,success){
    if(error){
        console.log(error);
    }else{
        console.log("Server is ready to take our messages");
    }
})

let mailOptions = {
    from: '"博物馆应用管理系统" sekaiiiii@163.com', // sender address
    to: "qq738359456@163.com", // list of receivers
    subject: "注册验证码", // Subject line
    html: html // html body
};
transporter.sendMail(mailOptions,(error,info = {})=>{
if(error){
    console.log(error);
}else{
    console.log('发送成功')
}
});

