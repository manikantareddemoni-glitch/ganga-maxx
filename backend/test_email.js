const nodemailer = require('nodemailer'); nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, secure: false }).verify().then(console.log).catch(console.error);  
