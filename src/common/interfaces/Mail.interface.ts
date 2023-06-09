export interface MailOptions {
  /** The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>' */
  from?: string;
  /** An e-mail address that will appear on the Sender: field */
  sender?: string ;
  /** Comma separated list or an array of recipients e-mail addresses that will appear on the To: field */
  to?: string ;
  /** Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field */
  cc?: string ;
  /** Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field */
  bcc?: string ;
  /** An e-mail address that will appear on the Reply-To: field */
  replyTo?: string ;
  /** The message-id this message is replying */
  inReplyTo?: string ;
  /** Message-id list (an array or space separated string) */
  references?: string | string[];
  /** The subject of the e-mail */
  subject?: string;
  /** The plaintext version of the message */
  text?: string | Buffer ;
  /** The HTML version of the message */
  html?: string | Buffer ;
  /** Apple Watch specific HTML version of the message, same usage as with text and html */
  watchHtml?: string | Buffer ;
  /** AMP4EMAIL specific HTML version of the message, same usage as with text and html. Make sure it is a full and valid AMP4EMAIL document, otherwise the displaying email client falls back to html and ignores the amp part */
  amp?: string | Buffer ;
  /** iCalendar event, same usage as with text and html. Event method attribute defaults to ‘PUBLISH’ or define it yourself: {method: 'REQUEST', content: iCalString}. This value is added as an additional alternative to html or text. Only utf-8 content is allowed */
  icalEvent?: string | Buffer ;

  /** optional Message-Id value, random value will be generated if not set */
  messageId?: string;
  /** optional Date value, current UTC string will be used if not set */
  date?: Date | string;
  /** optional transfer encoding for the textual parts */
  encoding?: string;

  priority?: "high"|"normal"|"low";
}
