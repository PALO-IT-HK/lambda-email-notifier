'use strict';
const fetch = require('node-fetch')

module.exports.fetchTopUsageData = (event, context, callback) => {
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
        callback(null, result)
      })
    })
    .catch(err => {
      console.log('Error: ' + err)
    })
}
