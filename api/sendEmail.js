const aws = require('aws-sdk');
const moment = require('moment');

const ses = new aws.SES({ region: 'us-east-1' });

function sesSendEmail(eventObject) {
  const today = moment().subtract(1, 'year').format('YYYYMMDD');

  return new Promise((resolve, reject) => {
    const param = {
      Destination: {
        ToAddresses: [
          eventObject.email,
        ],
      },
      Message: {
        Body: {
          Html: {
            Data: eventObject.dataToSend,
            Charset: 'UTF-8',
          },
          Text: {
            Data: eventObject.dataToSend,
            Charset: 'UTF-8',
          },
        },
        Subject: {
          Data: `Top 5 Stations in London - ${today}`,
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

    ses.sendEmail(param, (err, data) => { err ? reject(err) : resolve(data); });
  });
}

module.exports.handler = (event, context, callback) => {
  sesSendEmail(event)
    .then((data) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          status: 'success',
          msg: 'Email Sent Successfully',
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          status: 'failed',
          msg: `Error in Sending Email: ${err}`,
        }),
      });
    });
};
