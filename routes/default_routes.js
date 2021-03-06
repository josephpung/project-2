const express = require("express")
const router = express.Router()

const Thread = require('../models/threads')
const User = require("../models/user")
const Answer = require("../models/answers")
const Admin = require("../models/admin")


const { hasLoggedOut, isLoggedIn } = require('../helpers')

router.get('/', (req, res) => {
  if(req.user === undefined || req.user.coursePref === "no"){

    Thread.find().sort({sortDate: -1}) // CHANGED TO DATE SORT, READ HERE PLS
    .then(result=>{
      res.render("user/home",{
        title: "Questions",
        threads: result
      })
    })
  }else if(req.user.coursePref === "yes"){
    Thread.find({ course: req.user.course}, function (err, data) {
      if (err) {
        console.log(err)
        return
      }
      // console.log(req.flash());
      res.render('user/home', {
        title: "Questions",
        threads: data
      })
    }).sort({totalVotes: -1})
  }

})




router.get("/search",(req,res)=>{
  res.render("user/search",{
    title: "Search for a thread"
  })
})
router.get("/newquestion",(req,res)=>{
  res.render("user/newquestion",{
    title: "Ask a question!"
  })
})

router.get('/logout',hasLoggedOut, (req, res) => {
  req.logout()
  req.flash("success","successfully logged out")
  res.redirect('/')
})

router.get("/profile", hasLoggedOut, (req,res)=>{
  if(req.user.type==="user"){
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
  }else{
    Admin.findById(req.user.id)
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
}

})


router.post("/search", (req, res)=>{
  const keyword = req.body.keyword

  Thread.find({
    question: new RegExp(keyword, "i")
  })
  .then(results=>{
    res.send(results)
  })
})

router.post('/addquestions', function (req, res) {
  if(req.body.question === "" || req.body.description === ""){
    req.flash("error", "Question/Details field missing input, please try again")
    res.redirect("/newquestion")
  }else{
    var creatorId = ""
    if(!req.user) creatorId = "anonymous"
    else if(req.user.id) creatorId = req.user.id

    let newQues = new Thread({
      question: req.body.question,
      description: req.body.description,
      course: req.body.dropdown,
      creator: creatorId,
      sortDate: new Date(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()

    })

    newQues.save()
    .then(output => {
    })
    // debug code (output request body)
    res.redirect(`/thread/${newQues.id}`)
  }

})

router.post("/image", (req,res)=>{
  if(req.user.type==="user"){
    User.findByIdAndUpdate(req.user.id, {pic: req.body.upload})
    .then(user=>{
  res.redirect("/profile")
    })
  }else{
    Admin.findByIdAndUpdate(req.user.id, {pic: req.body.upload})
    .then(user=>{
  res.redirect("/profile")
    })
  }


})


router.put("/profile/:id", (req,res)=>{
  console.log(req.body.coursePref);
  if(req.body.coursePref !== "no" && req.body.coursePref !== "yes"){
    req.flash("error","Invalid course preference input, please type either 'yes' or 'no'")
    res.redirect("/profile")
  }else{
    if(req.user.type === "user"){
      User.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        email: req.body.email,
        course: req.body.course,
        coursePref: req.body.coursePref
      })
      .then(()=>{
        Answer.update(
     {creator: req.params.id}, //query, you can also query for email
     {$set: { creatorName: req.body.name}},
     {multi: true} //for multiple documents
    )
    .then(()=>{
      req.flash("info","Profile details updated!")
      res.redirect("/profile")
    })


      })
    }else if(req.user.type==="admin"){
      Admin.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        email: req.body.email,
        course: req.body.course,
        coursePref: req.body.coursePref
      })
      .then(()=>{
        Answer.update(
     {creator: req.params.id}, //query, you can also query for email
     {$set: { creatorName: req.body.name}},
     {multi: true} //for multiple documents
    )
    .then(()=>{
      req.flash("info","Profile details updated!")
      res.redirect("/profile")
    })


      })
    }

  }
})
// admin console edit users page ================
router.put("/profile/adminconsole/:id", (req,res)=>{
  User.findByIdAndUpdate(req.params.id,{
    name: req.body.name,
    email: req.body.email,
    course: req.body.course,
    coursePref: req.body.coursePref
  })
  .then(()=>{
    Answer.update(
 {creator: req.params.id}, //query, you can also query for email
 {$set: { creatorName: req.body.name}},
 {multi: true} //for multiple documents
)
.then(()=>{
  req.flash("success",`${req.body.name}'s Profile details updated!`)
  res.redirect("/admin/console#usersPage")
})


  })
})


router.delete("/user/:id", (req,res)=>{
  User.findByIdAndRemove(req.params.id)
  .then(()=>{
    req.flash("success","User removed")
    res.redirect("/admin/console#usersPage")
  })
})

module.exports= router
