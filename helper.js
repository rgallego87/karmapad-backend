// Microsoft Azure Cognitive API
const https = require ('https');
const accessKey = '5311744487344b86a34e8a8add74294d';
const uri = 'westeurope.api.cognitive.microsoft.com';
const path = '/text/analytics/v2.0/sentiment';

function getFromAzure(documents) {
  let body = JSON.stringify(documents);
  let request_params = {
    method: 'POST',
    hostname: uri,
    path: path,
    headers: {
        'Ocp-Apim-Subscription-Key': accessKey,
    }
  };
  
  return new Promise((resolve, reject) => {
    let req = https.request(request_params, (response) => {
      let body = '';
      
      response.on('data', function (d) {
        body += d;
      });
      
      response.on('end', function () {
        let body_ = JSON.parse (body);
        let body__ = JSON.stringify (body_, null, '  ');                
        // console.log (body__);
        resolve(body_);
      });
      
      response.on('error', function (e) {
        reject(e.message);
        console.log ('Error: ' + e.message);
      });

    });
            
    req.write(body);
    req.end();
  })
}

module.exports = getFromAzure;