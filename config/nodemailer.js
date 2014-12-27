var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'swishmessenger@gmail.com',
        pass: 'jinginaks'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Swish <swishmessenger@gmail.com>', // sender address
    to: 'anniyansachin@gmail.com', // list of receivers
    subject: 'Test', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Bold Text comes here</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});