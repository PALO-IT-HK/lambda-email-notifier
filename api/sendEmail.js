const aws = require('aws')
const ses = new aws.SES({ region: 'eu-west-1' })

module.exports.handler = (event, context) => {
  let params = {
    Destination: {
      ToAddresses: [
        "eerh@palo-it.com", 
        "elnathan.erh@gmail.com"
      ]
    }, 
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8", 
          Data: "This is the message body in text format."
        }
      }, 
      Subject: {
        Charset: "UTF-8", 
        Data: "Top 5 Stations in London for today"
      }
    }, 
    ReplyToAddresses: [], 
    ReturnPath: "", 
    ReturnPathArn: "", 
    Source: "elnathan.erh@gmail.com", 
    SourceArn: ""
  }

  ses.sendEmail(params, (err, data) => {
    if (err) console.log(err)
    else context.succeed(event)
  })
}