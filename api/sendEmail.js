const aws = require('aws-sdk')
const ses = new aws.SES({ region: 'us-east-1' })

module.exports.handler = (event, context) => {
  let params = {
    Destination: {
      ToAddresses: [
        "elnathan.erh@gmail.com",
      ]
    }, 
    Message: {
      Body: {
        Html: {
          Data: "This is the message body in Html format.",
          Charset: "UTF-8"
        },
        Text: {
          Data: "This is the message body in text format.",
          Charset: "UTF-8"
        }
      }, 
      Subject: {
        Data: "Top 5 Stations in London for today",
        Charset: "UTF-8"
      }
    }, 
    Source: "eerh@palo-it.com", 
    Tags: [
      {
        Name: 'Send_individual_email',
        Value: 'email1'
      }
    ]
  }

  ses.sendEmail(params, (err, data) => {
    if (err) console.log(err)
    else context.succeed(data.msg)
  })
}