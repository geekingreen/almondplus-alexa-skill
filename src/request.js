var https = require('https');

module.exports = function request(url, cb) {
    https.get(url, function (res) {
        var responseString = '';
        console.log('Status Code: ' + res.statusCode);

        if (res.statusCode != 200) {
            cb(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            var responseData = JSON.parse(responseString);

            if (responseData.success) {
                cb(null, responseData);
            } else {
                cb(new Error('Error making request'));
            }
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        cb(new Error(e.message));
    });
};
