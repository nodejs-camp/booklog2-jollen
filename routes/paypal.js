var events = require('events');
var express = require('express');
var router = express.Router();

// Paypal
var paypal_api = require('paypal-rest-sdk');

var config_opts = {
    'host': 'api.sandbox.paypal.com',
    'port': '',
    'client_id': 'AeQjSxAqfJJ_Km70P1rNuO_Tp6C9FWHdDWPsKfEpu8tDmEJpveUheghDcMto',
    'client_secret': 'ECSbXhDMCHRGU3VYH9-ByQzvhwX7y9ncvNeles7XU9PL2E6d4doHGfvp1BkA'
};

router.put('/1/post/:postId/pay', function(req, res, next) {
    var workflow = new events.EventEmitter();
    var postId = req.params.postId;
	var posts = req.app.db.model.Post;
    
    workflow.outcome = {
    	success: false
    };

    workflow.on('validate', function() {
        workflow.emit('createPayment');
    });

    workflow.on('createPayment', function() {
		paypal_api.configure(config_opts);

		var create_payment_json = {
		            intent: 'sale',
		            payer: {
		                payment_method: 'paypal'
		            },
		            redirect_urls: {

		                // http://localhost:3000/1/post/539eb886e8dbde4b39000007/paid?token=EC-4T17102178173001V&PayerID=QPPLBGBK5ZTVS
		                return_url: 'http://localhost:3000/1/post/' + postId + '/paid',
		                cancel_url: 'http://localhost:3000/1/post/' + postId + '/cancel'
		            },
		            transactions: [{
		                amount: {
		                    currency: 'TWD',
		                    total: 128
		                },
		                description: '購買教學文章'
		            }]
		};

		paypal_api.payment.create(create_payment_json, function (err, payment) {
		    if (err) {
		        console.log(err);
		    }

		    if (payment) {
		        console.log("Create Payment Response");
		        console.log(payment);
		    }
		});
    });

    workflow.on('response', function() {
    });

    return workflow.emit('validate');
});

module.exports = router;