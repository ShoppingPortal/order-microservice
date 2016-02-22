var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
// db config
var env = "dev";
var config = require('../database.json')[env];

// initialize database connection
var sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
		logging: console.log,
		timestamp: false
	}
);

  var OrderDAO = sequelize.import("./orderDao");  
  
  router.route('/order/insert')
  
	// create a order (accessed at POST http://localhost:8080/api/order/insert)
	.post(function(req, res) {

	var userId = req.body.userId;
	var productId = req.body.productId;
	var	unitPrice = req.body.unitPrice;
	var	quantity = req.body.quantity;
	var status = req.body.status;
	var json;
	if(!userId || !productId || !unitPrice || !quantity || !status)
	{
		json = JSON.stringify({
			status: 422,
			description: "Missing data",
			errors: [
				{
					msg : "Missing a required param in Json. Please check your JSON request."
				}
			],
			data : []
		});
	
		res.send(json);
		console.log("ERROR 422: Missing a required param in Json. Please check your JSON request.");
		return;
	}
	
	if(!(userId == parseInt(userId, 10)) 
		|| !(productId == parseInt(productId, 10)) 
		|| !(unitPrice == parseFloat(unitPrice, 10))
		|| !(quantity == parseInt(quantity, 10))
		|| !(status == "completed")) {
		json = JSON.stringify({
			status: 400,
			description: "Incorrect JSON",
			errors: [
				{
					msg : "Incorrect Json request. Please check your JSON request."
				}
			],
			data : []
		});
		res.send(json);
		console.log("ERROR 400: Incorrect value for a field in Json. Please check your JSON request.");
		return;
	}
	
	var order = OrderDAO.build({  userId: userId,
			productId: productId,
			unitPrice: unitPrice,
			quantity: quantity,
			status: status	});

	order.add(function(success){
		json = JSON.stringify({
			status: 200,
			description: "Order Created!",
			errors: [],
			data : [
				{
					orderId : success.id
				}
			]
		});	
		res.send(json);		
	},
	function(err) {
		json = JSON.stringify({
				status : 500,
				description : "Internal server error",
				errors: [
				  {
					  msg : error
				  }
				],
				data : []
			});
			res.send(json);
	});
});

router.route('/orders')
// get all the orders (accessed at GET http://localhost:8080/api/orders)
.get(function(req, res) {
	var order = OrderDAO.build();
	var json;
	order.retrieveAll(function(order) {
		if (order) {
		
		json = JSON.stringify({
			status: 200,
			description: "Returning the orders",
			errors: [],
			data : [
				{
					orders : order
				}
			]
		});
		
		res.send(json);
		} else {
			json = JSON.stringify({
				status : 404,
				description : "No orders found",
				errors: [
				  {
					  msg : "No orders found"
				  }
				],
				data : []
			});
			res.send(json);
		}
	  }, function(error) {
			json = JSON.stringify({
				status : 500,
				description : "Internal server error",
				errors: [
				  {
					  msg : error
				  }
				],
				data : []
			});
			res.send(json);
	  });
});


router.route('/order/:id')

// get a order by id(accessed at GET http://localhost:8080/api/order/:id)
.get(function(req, res) {
	var order = OrderDAO.build();
	var json;
	order.retrieveById(req.params.id, function(order) {
		if (order) {
			console.log("200 OK: order with id "+req.params.id+" retrieved");
			var orderArray = [ order ];
			json = JSON.stringify({
			status : 200,
			description : "Returning the order",
			errors: [],
			data : [
				{
					order : orderArray
				}
			]
		});
		res.send(json);
		} else {
		  console.log("ERROR 404: order with id "+req.params.id+" not found");
		  json = JSON.stringify({
			status : 404,
			description : "No data found",
			errors: [
			  {
				  msg : "order with id "+req.params.id+" not found"
			  }
			],
			data : []
		  });
		  res.send(json);
		}
	  }, function(error) {
		json = JSON.stringify({
			status : 500,
			description : "Internal server error",
			errors: [
			  {
				  msg : error
			  }
			],
			data : []
		});
		res.send(json);
	  });
});

router.route('/order/update/:id')

// update a order (accessed at POST http://localhost:8080/api/order/update/:id)
.post(function(req, res) {

	var order = OrderDAO.build();
	var json;
	order.status = req.body.status;
	
	if(!order.status)
	{
		json = JSON.stringify({
			status: 422,
			description: "Missing data",
			errors: [
				{
					msg : "Missing a required param in Json. Please check your JSON request."
				}
			],
			data : []
		});
	
		res.send(json);
		console.log("ERROR 422: Missing a required param in Json. Please check your JSON request.");
		
		return;
	}
	
	if(order.status === "cancel") {
			order.updateById(req.params.id, function(orders) {
				if (orders > 0) {
					console.log("200 OK: order with id "+req.params.id+" updated");	
					
					json = JSON.stringify({
					status: 200,
					description: "Order updated!",
					errors: [],
					data : [
							{
								orderId : req.params.id
							}
						]
					});
					
					res.send(json);
				
				} else {
					  console.log("ERROR 404: order with id "+req.params.id+" not found");
					  
					  json = JSON.stringify({
						status : 404,
						description : "No data found",
						errors: [
						  {
							  msg : "order with id "+req.params.id+" not found"
						  }
						],
						data : []
					  });
					  
					  res.send(json);		  
				}
			  }, function(error) {
					console.log("ERROR 500: Internal server error : "+error);
					json = JSON.stringify({
					status : 500,
					description : "Internal server error",
					errors: [
					  {
						  msg : error
					  }
					],
					data : []
					});
					
					res.send(json);
			  });
		return;
	  }
	
		json = JSON.stringify({
			status: 400,
			description: "Incorrect JSON",
			errors: [
				{
					msg : "Incorrect Json request. Please check your JSON request."
				}
			],
			data : []
		});
		res.send(json);
		console.log("ERROR 400: Incorrect value for a field in Json. Please check your JSON request.");	
	
});

// Middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

module.exports = router;