const nodemailer = require("nodemailer");
const config = require("config");
const transporter = nodemailer.createTransport({
  host: config.get("mail.host"),
  port: config.get("mail.port"),
  secure: config.get("mail.secure"),
  auth: {
    user: config.get("mail.user"),
    pass: config.get("mail.pass"),
  },
});

module.exports = transporter;