const mongoose = require("mongoose");
const Joi = require("joi");
const {random} = require("lodash")


const cardSchema = new mongoose.Schema({
  bizName:String,
  bizDescription:String,
  bizAddress:String,
  bizPhone:String,
  bizImage:String,
  bizNumber:Number,
  createdAt: { 
    type: Date, default: Date.now()
  },
  user_id:String
})

exports.CardModel = mongoose.model("cards",cardSchema);

exports.validCard = (_dataBody) => {
  let joiSchema = Joi.object({
    bizName:Joi.string().min(2).max(99).required(),
    bizDescription:Joi.string().min(2).max(500).required(),
    bizAddress:Joi.string().min(2).max(200).required(),
    bizPhone:Joi.string().min(2).max(20).required(),
    //allow -> Also allows to send empty string or not send at all
    bizImage:Joi.string().max(900).allow(null, '')
    
  })

  return joiSchema.validate(_dataBody)
}

//Produces a random number and checks that does not exist and does not belong to another business in the collection
exports.genBizNumber = async(CardModel) => {
  while(true){
    let randomNum = random(1,999999);
    let card = await CardModel.findOne({bizNumber:randomNum});
    if(!card){
      return randomNum;
    }
  }
}