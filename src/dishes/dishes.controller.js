const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//lists existing dishes
function list(req,res){
    res.json({data: dishes})
}
//OLD VALIDATE
// function validateDishProps(req,res,next){
//      const { data:{name,description,price, image_url} } = req.body;
//     if(!name || name == "")
//       return next({status: 400, message: `Dish must include a name`});
//     if (!description || description == "")
//       return next({ status: 400, message: `Dish must include a description` });
//     if (!price)
//       return next({ status: 400, message: `Dish must include a price`});
//     if (typeof price !== "number" || price <= 0)
//       return next({
//         status: 400,
//         message: `Dish must have a price that is an integer greater than 0`});
//     if (!image_url || image_url == "")
//       return next({ status: 400, message: `Dish must include an image_url` });
//       next();
// };

function validateNameProp(req,res,next){
  const {data: {name} }= req.body
  if(!name || name == ''){
    next({
      status: 400,
      message: `Dish must include a name`
    })
  }
  next()
}

function validateDescriptionProp(req,res,next){
  const {data: {description} }= req.body
  if(!description || description == ''){
    next({
      status: 400,
      message: `Dish must include a description`
    })
  }
  next()
}

function validatePriceProp(req,res,next){
  const {data: {price} }= req.body
  if (!price)
      return next({ status: 400, message: `Dish must include a price`});
  if(typeof price !=="number" || price <= 0 ){
    next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`
    })
  }
  next()
}

function validateImageProp(req,res,next){
  const {data: {image_url} }= req.body
  if(!image_url || image_url == ""){
    next({
      status: 400,
      message: `Dish must include an image_url`
    })
  }
  next()
}

//create a new dish
function create(req, res){
  const { data: { name, description, price, img } = {} } = req.body;
  const newId = new nextId();
  const newDish = {
    id: newId,
    name,
    description,
    price,
    img,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
//makes sure the dish at the Id exists to move on to the next bit of middleware
function dishExists(req,res,next){
  const dishId = req.params.dishId
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (foundDish){
    res.locals.dish = foundDish
    return next()
  }
  next({
    status: 404,
    message: `Dish does not exist ${dishId}`
  })
}
//update and existing dish
function update(req, res, next) {
  const originalId = req.params.dishId;
  const {
    data: { id, name, description, price, image_url },
  } = req.body;
  const updatedDish = {
    id: originalId,
    name,
    description,
    price,
    image_url,
  };

  res.json({ data: updatedDish });
}
//reads the data being requested from the url
function read(req, res, next) {
  res.json({ data: res.locals.dish });
}
//validate the dishid from the props
function validateDishId(req, res, next) {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;

	if(!id || id === dishId) {
		res.locals.dishId = dishId;
		return next();
	}

	next({
		status: 400,
		message: `Dish id ${id} does not match dish id ${req.params.dishId}`
	});
}


module.exports = {
    list,
    read: [dishExists, read],
    create: [
      validateNameProp,
      validateDescriptionProp,
      validatePriceProp,
      validateImageProp,
      create],
    update: [
      dishExists,
      validateNameProp,
      validateDescriptionProp, 
      validatePriceProp,
      validateImageProp,
      validateDishId,
      update]
}