var nodemailer = require("nodemailer");
var dateUtil = require('./dateUtil.js');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
  service: "Gmail",
  auth: {
    user: "36node@gmail.com",
    pass: "mse@2008"
  }
});

// setup e-mail data with unicode symbols
var mailOptions_activeAccount = {
  from: "36node<36node@gmail.com>",
  // sender address
  to: "zzswang@gmail.com",
  // list of receivers
  subject: "Account manager of 36node",
  // Subject line
  text: "Account manager of 36node!",
  // plaintext body
  html: " <b>Account manager of 36node!</b>" // html body
};

// send mail with defined transport object
exports.activeAccount = function(url, to, callback) {
  mailOptions_activeAccount.to = to;

  mailOptions_activeAccount.html =  '<p>您好：<p/>' +
    '<p>我们收到您在36node注册信息，请点击下面的链接来激活帐户。</p>' +
    '激活链接： <a href=' + url + '>' + url + '</a>' +
    '<p>若您没有在36node社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>36node社区 谨上。</p>';
  smtpTransport.sendMail(mailOptions_activeAccount, function(error, response) {
    if (error) {
      callback(false);
      console.log(error);
    } else {
      callback(true);
      console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });
};

exports.resetPassword = function(to, password, callback) {
  var mail = {
    from: '36node<36node@gmail.com>',
    to: to,
    subject: "36node has reset your password!",
    text: "36node has reset your password!"
  };

  mail.html = '<p>您好：<p/>' +
    '<p>我们收到您的重置密码请求，现已将您的密码重置为：</p>' + password +
    '<p>如果您并没有请求重置密码，说明有人冒用了你的邮箱，请联系我们</p>' + 
    '<p>36node社区 谨上。</p>';

  smtpTransport.sendMail(mail, function(error, response) {
    if (error) {
      callback(false);
      console.log("send reset password email failed: ");
      console.log(error);
    } else {
      callback(true);
      console.log("Reset password message sent: " + response.message);
    }
  });  
};


// setup e-mail data with unicode symbols
var mailOptions_dailyReport = {
  from: "36node<36node@gmail.com>",
  // sender address
  to: "jning@microstrategy.com",
  // list of receivers
  subject: "Microstrategy daily report",
  // Subject line
  text: "Microstrategy daily report",
  // plaintext body
  html: " <b>Microstrategy daily report</b>" // html body
};

var mailOptions_dailyReport_bak = {
  from: "36node<36node@gmail.com>",
  // sender address
  to: "manch.09@sem.tsinghua.edu.cn",
  // list of receivers
  subject: "Microstrategy daily report",
  // Subject line
  text: "Microstrategy daily report",
  // plaintext body
  html: " <b>Microstrategy daily report</b>" // html body
};

exports.sendDailyOrders = function(orders){
  var html = '<table><thead><tr><th>姓名</th><th>时间</th><th>订单内容</th><th>总计</th></tr></thead><tbody>';
  orders.forEach(function(order){
    var content = '订单详情: ';
    order.lineItems.forEach(function(item){
      content += item.name + item.count + '份 ';
    });
    html += '<tr><td>' + order.userName + '</td><td>' + dateUtil.short_date(order.date) + '</td><td>' + content + '</td><td>' + order.totalCost + '</td></tr>';
  });
  html += '</tbody></table>';

  mailOptions_dailyReport.html = html;
  smtpTransport.sendMail(mailOptions_dailyReport, function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("daily report sent to ningjing: " + response.message);
    }
  });

  mailOptions_dailyReport_bak.html = html;
  smtpTransport.sendMail(mailOptions_dailyReport_bak, function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log("daily report sent to manchun: " + response.message);
    }
  });
}

