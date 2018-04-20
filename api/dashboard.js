'use strict';

const fetch = require('node-fetch');
const aws = require('aws-sdk');

const ses = new aws.SES({ region: 'us-east-1' });
const lambda = new aws.Lambda();

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

function getSESIdentifyVerificationAttributes(emails) {
  return new Promise((resolve, reject) => {
    ses.getIdentityVerificationAttributes({
      Identities: emails,
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    });
  });
}

function sendEmailLambda(functionName, payload) {
  return new Promise((resolve, reject) => {
    lambda.invoke({
      FunctionName: functionName, // the lambda function we are going to invoke
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify(payload)
    }, (err, data) => {
      if(err) reject(err)
      else resolve(data)
    })
  })
}

module.exports.fetchTopUsageDataAndSendEmail = (event, context, callback) => {
  // todo handle date range
  fetch('https://api.ci.palo-it-hk.com/usages/top-usage/5/type/total/daterange/20170410/20170411')
    .then((response) => {
      if (response.status !== 200) {
        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return callback(null, {
          statusCode: 500,
          body: JSON.stringify({
            status: 'failed',
            msg: 'error from upstream api',
          }),
        });
      }
      return response.json().then((json) => {
        const result = {
          statusCode: 200,
          data: json,
        };

        // Get the list of identities from SES
        listSESIdentities()
          .then(data => {
            getSESIdentifyVerificationAttributes(data.Identities)
              .then(data => {
                const resultsObj = data.VerificationAttributes
                let updatedArray = []
                  for(let key in resultsObj) {
                   updatedArray.push({
                     email: key,
                     status: resultsObj[key].VerificationStatus
                   })
                  }
                return updatedArray.filter(item => item.status !== 'Pending' && item.email !== 'eerh@palo-it.com')
              })
              .then(emailsArray => {
                // Create email object
                const emailObject = {
                  dataToSend:         
                    [
                      `<table>
                        <tr>
                          <th>Station Name</th>
                          <th>District</th>
                          <th>Total Bikes Count</th>
                          <th>Total Bikes Out</th>
                          <th>Total Bikes In</th>
                        </tr>`,
                      emailsArray.map(station =>
                        `
                          <tr>
                            <td>${station.location}</td>
                            <td>${station.district}</td>
                            <td>${station.totalBikesCount}</td>
                            <td>${station.totalBikesOut}</td>
                            <td>${station.totalBikesIn}</td>
                          </tr>
                          `).join(''),
                      '</table>',
                    ].join(''),
                }

                // Send individual email for each email in array
                emailsArray.forEach(item => {
                  const payload = {
                    dataToSend: emailObject.dataToSend,
                    email: item.email
                  }
                  sendEmailLambda('dashboard-dev-sendEmail', payload)
                    .then(data => {
                      callback(null, {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({
                          status: 'accepted',
                          msg: 'Call sendEmail lambda function success!'
                        })
                      })
                    })
                    .catch(err => {
                      callback(null, {
                        statusCode: 500,
                        body: JSON.stringify({
                          status: 'failed',
                          msg: 'Call sendEmail lambda function failed!'
                        })
                      })
                    })
                })
              })
                

    
                

          })
        
        //     })
        //   })
        //   .catch(err => {
        //     console.log(err)
        //     callback(null, {
        //       statusCode: 500,
        //       headers: corsHeaders,
        //       body: JSON.stringify({
        //         status: 'failed',
        //         msg: 'Unknown error occured',
        //       })
        //     })
        //   }) // closing for catch function
        // })
      }) // .then(emailsArray => {
    })
  }
            // // Filter source email (eerh@palo-it.com) out from the list
            // const filteredEmailList = data.Identities.filter(email => email !== 'eerh@palo-it.com')
            // const emailObject = {
            //   dataToSend:         
            //     [
            //       `<table>
            //         <tr>
            //           <th>Station Name</th>
            //           <th>District</th>
            //           <th>Total Bikes Count</th>
            //           <th>Total Bikes Out</th>
            //           <th>Total Bikes In</th>
            //         </tr>`,
            //       result.data.map(station =>
            //         `
            //           <tr>
            //             <td>${station.location}</td>
            //             <td>${station.district}</td>
            //             <td>${station.totalBikesCount}</td>
            //             <td>${station.totalBikesOut}</td>
            //             <td>${station.totalBikesIn}</td>
            //           </tr>
            //           `).join(''),
            //       '</table>',
            //     ].join(''),
            // }
            // filteredEmailList.forEach(email => {
            //   const payload = {
            //     dataToSend: emailObject.dataToSend,
            //     email: email
            //   }
            //   const sendEmailLambdaParams = {
            //     FunctionName: 'dashboard-dev-sendEmail', // the lambda function we are going to invoke
            //     InvocationType: 'RequestResponse',
            //     LogType: 'Tail',
            //     Payload: JSON.stringify(payload)
            //   }
            
              // lambda.invoke(sendEmailLambdaParams, (err, data) => {
              //   if(err) {
              //     return callback(null, {
              //       statusCode: 500,
              //       body: JSON.stringify({
              //         status: 'failed',
              //         msg: 'Invoke sendEmail Lambda error: ' + err
              //       })
              //     })
              //   }
              //   else {
              //     return callback(null, {
              //       statusCode: 200,
              //       body: JSON.stringify({
              //         status: 'success',
              //         msg: 'Invoke sendEmail Lambda successful'
              //       })
              //     })
              //   }
              // }) // lambda.invoke closing brackets
    //         }) // forEach closing brackets
    //       }
    //     });
    //   });
    // })
    // .catch((err) => {
    //   console.log(`Error: ${err}`);
    //   return callback(null, {
    //     statusCode: 500,
    //     body: JSON.stringify({
    //       status: 'failed',
    //       msg: 'unknown error occurred',
    //     }),
    //   });
    // });
