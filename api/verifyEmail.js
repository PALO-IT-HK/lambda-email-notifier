const aws = require('aws-sdk');

const ses = new aws.SES({ region: 'us-east-1' });

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST',
};

function listSESIdentities() {
  return new Promise((resolve, reject) => {
    ses.listIdentities({
      IdentityType: 'EmailAddress',
      MaxItems: 1000,
      NextToken: '',
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function getSESIdentifyVerificationAttributes(email) {
  return new Promise((resolve, reject) => {
    ses.getIdentityVerificationAttributes({
      Identities: [email],
    }, (err, data) => {
      if (err) {
        reject(err);
      } else if (data.VerificationAttributes[email]) {
        resolve(data.VerificationAttributes[email].VerificationStatus); // 'Success' for verified, 'Pending' / 'Failed' for unverified email
      } else {
        resolve(undefined);
      }
    });
  });
}

function verifyEmailIdentity(email) {
  return new Promise((resolve, reject) => {
    ses.verifyEmailIdentity({
      EmailAddress: email,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function handler(event, context, callback) {
  const requestBody = JSON.parse(event.body);
  const emailToVerify = requestBody.email;

  console.log({
    body: requestBody,
    emailToVerify,
  });

  listSESIdentities()
    .then((emailList) => {
      if (emailList.Identities.find(email => email === emailToVerify)) {
        return getSESIdentifyVerificationAttributes(emailToVerify);
      }
      return 'Not Found';
    })
    .then((emailStatus) => {
      if (emailStatus === 'Success') {
        callback(null, {
          statusCode: 400,
          headers: {
            ...corsHeaders,
          },
          body: JSON.stringify({
            status: 'failed',
            msg: 'email has already verified',
          }),
        });
        return Promise.resolve();
      }
      return verifyEmailIdentity(emailToVerify).then((data) => {
        console.log({data});
        callback(null, {
          statusCode: 202,
          headers: {
            ...corsHeaders,
          },
          body: JSON.stringify({
            status: 'accepted',
            msg: 'adding user to SES and sending verification email',
          }),
        });
      });
    })
    .catch((err) => {
      console.log({ err });
      callback(null, {
        statusCode: 500,
        headers: {
          ...corsHeaders,
        },
        body: JSON.stringify({
          status: 'failed',
          msg: 'unknown error occurred',
        }),
      });
    });
}


module.exports = {
  listSESIdentities,
  getSESIdentifyVerificationAttributes,
  handler,
};
