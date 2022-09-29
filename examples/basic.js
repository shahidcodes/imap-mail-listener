const { MailListener } = require("../src");

const imapConfig = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT,
  tls: true,
};

const listener = new MailListener(imapConfig);

listener.on("mail", (mail) => {
  console.log("new mail", mail);
});
