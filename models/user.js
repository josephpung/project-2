const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt');


// const checkSchema = new mongoose.Schema({
//   voteId: String
// })
// create a schema
const userSchema = new Schema({
  name: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: {type: String},
  pic: {type: String},
  course: {type: String},
  coursePref: {type: String, default: "no"},
  threadUp: Array,
  threadDown: Array,
  answerUp: Array,
  answerDown: Array,
  type: {type: String, default:"user"}
})


userSchema.pre("save", function(next){

  var user = this

  user.slug = user.name.toLowerCase().split(" ").join("-")
  if (!user.isModified('password')) return next();

  //hash the password
  bcrypt.hash(user.password, 11)
  .then(hash =>{
    console.log(`[HASHING PASSWORD] : - the hash is ${hash}, password is ${user.password}`)
    user.password = hash
    next()

  })

  // Override the cleartext password with the hashed one
  // console.log("Pre save flow", user);
})

userSchema.methods.validPassword = function(plainPassword, callback) {
  // Compare is a bcrypt method that will return a boolean,
  bcrypt.compare(plainPassword, this.password, callback)
}

const User = mongoose.model('User', userSchema)

// make this available to our other files
module.exports = User
