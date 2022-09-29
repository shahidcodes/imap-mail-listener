const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { EventEmitter } = require("node:events");

class MailListener extends EventEmitter {
  constructor(imapOptions) {
    super({
      captureRejections: true,
    });
    this.imap = new Imap(imapOptions);
    this.init();
  }

  fetchUnread() {
    this.imap.search(["UNSEEN"], (err, results) => {
      if (err) {
        return err;
      }
      results.forEach((result) => {
        const fetchStream = this.imap.fetch(result, {
          bodies: "",
          markSeen: true,
        });

        fetchStream.on("error", (fError) => {
          console.log("message fetch error", fError);
          this.emit("error", fError);
          this.emit("message:error", fError);
        });

        fetchStream.on("message", (message) => {
          message.on("body", (stream) => {
            simpleParser(stream, (messageParseError, parsedMail) => {
              console.log(parsedMail);
              this.emit("mail", parsedMail);
            });
          });
        });
      });
      return true;
    });
  }

  init() {
    this.imap.once("ready", () => {
      this.emit("connected");
      this.imap.openBox("INBOX", false, (err) => {
        if (err) {
          this.emit("error", err);
          return err;
        }
        this.fetchUnread();
        this.imap.on("mail", this.fetchUnread.bind(this));
        this.imap.on("update", this.fetchUnread.bind(this));
        return true;
      });
    });
    this.imap.connect();
  }
}

module.exports = { MailListener };
