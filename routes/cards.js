const express = require("express");
const { CardModel, validCard, genBizNumber } = require("../models/cardsModel");
const { authToken, checkIfBiz } = require("../middlewares/auth")
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let perPage = (req.query.perPage) ? Number(req.query.perPage) : 6;
    let page = (req.query.page) ? Number(req.query.page) : 0;
    // Defines by what to sort
    let sort = (req.query.sort) ? req.query.sort : "_id" ;
    // Defines that if you get a reverse ace will present from the big to the small and if not the other way around
    let reverse = (req.query.reverse == "yes") ? -1 : 1;
    let data = await CardModel.find({})
      .limit(perPage)
      .skip(page * perPage)
      // [sort] -> Brings the key that is within the sort variable and not the key sort
      .sort({ [sort]: reverse });
    // .sort({_id:-1}) // Make sure the last entry is displayed first
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
  // res.json({msg:"cards work"});
})

router.get("/single/:cardId" , async(req, res) => {
  try{
    let cardId = req.params.cardId;
    let card = await CardModel.findOne({_id: cardId});
    res.json(card);
  }
  catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

// Returns the amount of records in the Collection Cards
//Need it for the pagination
router.get("/totalCards", async(req, res) => {
  try{
    let data = await CardModel.countDocuments({});
    res.json({count:data});
  }
  catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})

router.get("/userCardsAdded", authToken,async (req, res) => {
  try {
    let perPage = (req.query.perPage) ? Number(req.query.perPage) : 5;
    let page = (req.query.page) ? Number(req.query.page) : 0;
    let sort = (req.query.sort) ? req.query.sort : "_id" ;
    let reverse = (req.query.reverse == "yes") ? -1 : 1;
    let data = await CardModel.find({user_id:req.tokenData._id})
      .limit(perPage)
      .skip(page * perPage)
   
      .sort({ [sort]: reverse });
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(400).json(err)
  }
})


// add new card
// checkIfBiz ->Middle ware that checked that the user is a business and not a regular user
router.post("/", authToken , checkIfBiz, async (req, res) => {
  let validBody = validCard(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    
    //Option a
    // Will first make a request to a model user who checks that the user is a dealer in Maidl War
    // Option b
    // Another feature can be produced in the token that contains the bees in addition to the islands
    // We went for the option a


    let card = new CardModel(req.body);
    //Add a user's ID property
    // Before keeping in the database
    card.user_id = req.tokenData._id;
    
    card.bizNumber = await genBizNumber(CardModel);
    await card.save();
    res.status(201).json(card);

  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.delete("/:idDel", authToken, async (req, res) => {
  let idDel = req.params.idDel;
  try {
    //For security we also check that Ai is quite equal to the parameter we got from were r al
    // but also check that its user ID record is equal to an ID encrypted in a token
    // Sent with the request
    let data = await CardModel.deleteOne({ _id: idDel , user_id:req.tokenData._id });
    //If successful we will get an equal 1
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.put("/:idEdit", authToken, async (req, res) => {
  let idEdit = req.params.idEdit
  let validBody = validCard(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // Will only be able to edit a record whose user ID is equal to the information of the ID
    // Sent with the token
    let data = await CardModel.updateOne({ _id: idEdit , user_id:req.tokenData._id }, req.body);
    //If successful we will get an equal 1
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

module.exports = router;