const express = require("express");
const bcrypt = require("bcrypt");
const {authToken} = require("../middlewares/auth");
const {pick} = require("lodash")

const {CardModel} = require("../models/cardsModel");
const { validUser, UserModel , validLogin , getToken, validCardsArray } = require("../models/userModel");



const router = express.Router();

router.get("/",async(req,res) => {
  res.json({msg:"users work"})
})

router.get("/userInfo", authToken ,async(req,res) => {
  try{
    console.log(req.tokenData)
    // Query for publishing information about the user according to the IDs we collected from the token
    //{password:0} Means to display all properties except the password
    // req.decodeToken - Comes from the middle line 13 model ware
    let data = await UserModel.findOne({_id:req.tokenData._id},{password:0});
    res.json(data);
  }
  catch(err){
    console.log(err)
    res.status(400).json(err)
  }
})

//Check if the token is OK and returns OK status
//Rout that does not work through the database
router.get("/authUser", authToken , async(req,res) =>{
  res.json({status:"ok"});
})

//Will pull out all the cards that the user has liked / paid for at the request of Patch
// There will be a double request here as well first we will remove the array from the user and then we will talk to
// The card is modeled and we draw all the cards that Sapphire Biz matches to their records
router.get("/userCardsFav", authToken , async(req,res) => {
  try{
    //First pull out the array of card numbers
    let user = await UserModel.findOne({_id:req.tokenData._id});
    // cards_ar -> ["0000","11111","22222"] Example what we got from the request in the line above
    let cards_ar = user.cards;
    // Then only the cards in the set we have drawn are drawn from the cards collection
    // In the previous lines
    let userCards = await CardModel.find({bizNumber: { $in:cards_ar}})
    res.json(userCards);
  }
  catch(err){
    console.log(err)
    res.status(400).json(err)
  }
})


//Update the cards that the user has made them a favorite
router.patch("/cards", authToken, async(req,res) => {
  let validBody = validCardsArray(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let data = await UserModel.updateOne({_id:req.tokenData._id}, req.body);
    res.json(data);
  }
  catch(err){
    console.log(err)
    res.status(400).json(err)
  }
})

// Adding a new user
router.post("/",async(req,res) => {
  let validBody = validUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = new UserModel(req.body);
    // Encrypts the password at the level of 10
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    res.status(201).json(pick(user,["name","email","_id","createdAt"]));
  }
  catch(err){
   
    if(err.code == 11000){
      return res.status(400).json({err:"User/Email already in system! try to log in", code:11000})
    }
    console.log(err)
    res.status(400).json(err)
  }
})

router.post("/login",async(req,res) => {
  let validBody = validLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    // Check if there is a user with such an email at all
    let user = await UserModel.findOne({email:req.body.email});
    if(!user){
      //Returns an error message that no user was found
      return res.status(401).json("User or password not found 1");
    }
    // console.log(user)
    //Checks if the password is correct
    let validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass){
      return res.status(401).json("User or password not found 2");
    }
    //Produce token
    let newToken = getToken(user._id)
    res.json({token:newToken});

  }
  catch(err){
 
    console.log(err)
    res.status(400).json(err)
  }
})

module.exports = router;