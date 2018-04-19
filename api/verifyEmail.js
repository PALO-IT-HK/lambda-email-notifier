const aws = require('aws-sdk');

const ses = new aws.SES({ region: 'us-east-1' });

module.exports.handler = (event, context, callback) => {
  const identityParams = {
    IdentityType: 'EmailAddress',
    MaxItems: 123,
    NextToken: '',
  };

  // List all the identities in SES
  ses.listIdentities(identityParams, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      // Check if email passed from frontend already exists
      const identitiesArray = data.Identities;
      const emailAddress = event.email;
      const filteredResult = identitiesArray.filter(email => email === emailAddress);

      // If email does not exist in SES, send to SES for verification
      if (filteredResult.length === 0) {
        const params = {
          EmailAddress: event.email,
        };
        ses.verifyEmailIdentity(params, (err, data) => {
          if (err) console.log(err, err.stack);
          else {
            callback(null, {
              statusCode: 200,
              body: data,
            });
          }
        });
      }
    }
  });
};
