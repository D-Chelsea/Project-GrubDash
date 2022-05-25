const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req,res){
  res.json({ data: orders })
}
//validate the orders to make sure it is in the correct format
// function validateOrderProps  (req, res, next)  {
//   const {data: { deliverTo, mobileNumber, status, dishes } } = req.body;
//   if (!deliverTo || deliverTo == "")
//     return next({ status: 400, message: `Order must include a deliverTo` });
//   if (!mobileNumber || mobileNumber == "")
//     return next({ status: 400, message: `Order must include a mobileNumber` });
//   if (!dishes)
//     return next({ status: 400, message: `Order must include a dish` });
//   if (!Array.isArray(dishes) || dishes.length <= 0)
//     return next({
//       status: 400,
//       message: `Order must include at least one dish`,
//     });
//   dishes.forEach((dish, index) => {
//     if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity != "number")
//       return next({
//         status: 400,
//         message: `Dish ${index} must have a quantity that is an integer greater than 0`});
//   })
//   next();
// };

function validateDeliverTo(req,res,next){
  const {data: {deliverTo} }= req.body
  if(!deliverTo || deliverTo == ''){
    next({
      status: 400,
      message: `Order must include a deliverTo`
    })
  }
  next()
}
function validateMobileNumber(req,res,next){
  const {data: {mobileNumber} }= req.body
  if(!mobileNumber || mobileNumber == ''){
    next({
      status: 400,
      message: `Order must include a mobileNumber`
    })
  }
  next()
}
function validateDishes(req,res,next){
  const {data: {dishes} }= req.body
  if (!dishes)
      return next({ status: 400, message: `Order must include a dish` });
  if (!Array.isArray(dishes) || dishes.length <= 0)
    return next({
      status: 400,
      message: `Order must include at least one dish`,
      });
    dishes.forEach((dish, index) => {
  if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity != "number")
    return next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`});
  })
  next();
}


//create a new order
function create(req, res){
  const {data: { deliverTo, mobileNumber, status, dishes },} = req.body
  const newId = new nextId()
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}
//makes sure the order exists when being requested
function orderExists(req,res,next){
  const orderId = req.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder){
    res.locals.order = foundOrder
    next()
  }
    next({
    status: 404,
    message: `Order with id ${orderId} does not exist`
  })
}
//reads the order beign requested
function read(req,res,next){
  res.json({data: res.locals.order })
}

//making sure the order status is valid beofre moving onto the next bit of middleware
function isStatusValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status !== ("pending" || "preparing" || "out-for-delivery" || "delivered")){
    next({
      status: 400,
      message:`Order must have a status of pending, preparing, out-for-delivery, delivered.`,
      });
    }if (status === "delivered") {
      return next({
        status: 400,
        message: `A delivered order cannot be changed.`,
      });
    }
   next();
}


//updates an existing order
function update(req, res, next) {
  const originalId = req.params.orderId;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body
  const updatedOrder = {
    id: originalId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  if (id && id !== originalId)
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${originalId}`,
    });
  return res.json({ data: updatedOrder });
}
//deletes an order by the order Id
function destroy (req, res, next) {
  if (res.locals.order.status !== "pending")
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  const orderId = req.params.orderId;
  const index = orders.findIndex((order) => order.id == orderId);
  if (index > -1) orders.splice(index, 1);
  res.sendStatus(204);
};

module.exports ={
  list,
  create: [validateDeliverTo, validateMobileNumber, validateDishes, create],
  read: [orderExists, read],
  update: [orderExists,validateDeliverTo, validateMobileNumber, validateDishes ,isStatusValid, update],
  delete:[ orderExists, destroy]
}