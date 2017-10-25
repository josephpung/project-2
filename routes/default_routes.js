const express = require("express")
const router = express.Router()

const Thread = require('../models/threads')
const User = require("../models/user")
const Answer = require("../models/answers")


const { hasLoggedOut, isLoggedIn } = require('../helpers')

router.get('/', (req, res) => {
  Thread.find({}, function (err, data) {
    if (err) {
      console.log(err)
      return
    }
    res.render('user/home', {
      title: 'Questions In DB',
      threads: data

    })
  }).sort({totalVotes: -1})
})

router.get("/newquestion",(req,res)=>{
  res.render("user/newquestion",{
    title: "Ask a question!"
  })
})

router.get('/logout',hasLoggedOut, (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get("/profile",hasLoggedOut, (req,res)=>{
  User.findById(req.user.id)
  .then(user=>{
    Thread.find({creator:req.user.id})
    .then(thread=>{
    Answer.find({creator:req.user.id})
    .then(ans=>{
      res.render("user/profile_page",{
        profile: user,
        title: `${req.user.name}'s Profile`,
        answers:ans,
        questions:thread
      })
    })
  })

  })

})


router.post('/addquestions', function (req, res) {
  var creator = ""
  if(!req.user) creator = "anonymous"
  else if(req.user.id) creator = req.user.id

  let newQues = new Thread({
    question: req.body.question,
    description: req.body.description,
    creator: creator

  })

  newQues.save()
  .then(output => {
    displayResults(output.ops)
  })
  // debug code (output request body)
  res.redirect("/")
})

router.post("/image", (req,res)=>{
  User.findByIdAndUpdate(req.user.id, {pic: req.body.upload})
  .then(user=>{
res.redirect("/profile")
  })

})

// router

module.exports= router