'use strict';
const fetch = require('node-fetch')
const aws = require('aws-sdk')
const ses = new aws.SES({ region: 'us-east-1' })

module.exports.fetchTopUsageDataAndSendEmail = (event, context, callback) => {
  fetch('https://api.ci.palo-it-hk.com/usages/top-usage/5/type/total/daterange/20170410/20170411')
    .then(response => {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status)
        return
      }
      response.json().then(json => {
        const result = {
          statusCode: 200,
          data: json
        }
        // callback(null, JSON.stringify(result.data))
        const dataToSend = 
        [
          `<table>
            <tr>
              <th>Station Name</th>
              <th>District</th>
              <th>Total Bikes Count</th>
              <th>Total Bikes Out</th>
              <th>Total Bikes In</th>
            </tr>`,
            result.data.map(station =>   
              `
              <tr>
                <td>${station.location}</td>
                <td>${station.district}</td>
                <td>${station.totalBikesCount}</td>
                <td>${station.totalBikesOut}</td>
                <td>${station.totalBikesIn}</td>
              </tr>
              `
            ).join(''),
            `</table>`
        ].join('')
        
        // Define Email Params
        let params = {
          Destination: {
            ToAddresses: [
              "elnathan.erh@gmail.com",
            ]
          }, 
          Message: {
            Body: {
              Html: {
                Data: dataToSend,
                Charset: "UTF-8"
              },
              Text: {
                Data: dataToSend,
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
        
        // Send the email
        ses.sendEmail(params, (err, data) => {
          if (err) console.log(err)
          else { 
            context.succeed(data.msg)
            callback(null, 'Email Sent Successfully')
          }
        })
      })
    })
    .catch(err => {
      console.log('Error: ' + err)
    })
}
