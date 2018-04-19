const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-east-1' });

module.exports.handler = (event, context, callback) => {
  const emailToSend = event.email
  const dataToSend = event.dataToSend

  // Get email list
  // Define Email Params
  const params = {
    Destination: {
      ToAddresses: [
        emailToSend,
      ],
    },
    Message: {
      Body: {
        Html: {
          Data: dataToSend,
          Charset: 'UTF-8',
        },
        Text: {
          Data: dataToSend,
          Charset: 'UTF-8',
        },
      },
      Subject: {
        Data: 'Top 5 Stations in London for today',
        Charset: 'UTF-8',
      },
    },
    Source: 'eerh@palo-it.com',
    Tags: [
      {
        Name: 'Send_individual_email',
        Value: 'email1',
      },
    ],
  };

  // Send the email
  ses.sendEmail(params, (err, data) => {
    if (err) {
      console.log(err);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          status: 'failed',
          msg: 'error from sending email',
        }),
      });
    }
    console.log(data);
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        status: 'success',
        msg: 'Email Sent Successfully',
      }),
    });
  });
}