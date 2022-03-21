const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secret = 'IqlmEHtxHIBatVp3DSWMQezakya8oCJ8Q2oSoRXtVT4KcRoufBf68Ei4NS7QqaR'
const cors = require('cors')

//IMPORTING VALIDATION ALGORITHEM
const { registerValidation, loginValidation } = require('../validation')
router.post('/verify', cors(), (req,res) => {
  const token = req.header('auth-token')
  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        throw err;
      } else {
        res.send({ userId: decodedToken._id, iat: decodedToken.iat, valid: true})
      }
    })
  } else {
    console.log('error..')
    res.send({valid: false})
  }
})
router.post('/register', cors(), async (req,res) => {
  // VALIDATING API POSTS....
  const { error } = registerValidation(req.body);
  if(error) return res.send({error: error.details[0].message})

  const emailExists = await User.findOne({email: req.body.email})
  if(emailExists) return res.send('Email already in database')

  const salt = await bcrypt.genSalt(10)

  const hashPass = await bcrypt.hash(req.body.password, salt)
  
  const user = new User({
    name: req.body.name.toLowerCase(),
    email: req.body.email.toLowerCase(),
    password: hashPass,
    username: req.body.username.toLowerCase()
  })
  try {
    const savedUser = await user.save().then((savedUser)=>{
      res.send({ user: user._id })
    })
  }catch(err) {
    res.status(400).send(err)
    console.log(err)
  }
})

//LOGIN
router.post('/login', cors(), async (req,res) => {
  const { error } = loginValidation(req.body);
  
  if(error) return res.send({error: error.details[0].message})

  const user = await User.findOne({username: req.body.username.toLowerCase()})
  
  if(!user) return res.send('Username or password is incorrect!')

  const validPass = await bcrypt.compare(req.body.password, user.password)
  
  if (!validPass) return res.send('Invalid credentials...');
  const token = jwt.sign({_id: user._id}, secret)
  res.header({'auth-token': token, 'Access-Control-Expose-Headers': 'auth-token'}).send(token)

})
// Verify User Login

router.post('/getuserdata', async (req,res) => {
  const requestUserId = req.body.userid

  const Id = await User.findOne({_id: requestUserId})
  if (!Id) {
    res.send('The requested user was not found on the server.')
  } else {
    const data = Id;
    const name = Id.name
    const email = Id.email
    const date = Id.date
    const sendArray = {name: name, email: email, date: date}
    res.send(sendArray)
}
})
router.post('/creds/platform/lost-password', cors(), async (req,res) => {
  const requestUsername = req.body.username.toLowerCase()
  const requestEmail = req.body.email.toLowerCase()
  const requestPass = await req.body.pass;
  const salt = await bcrypt.genSalt(10)
  const hashPass = await bcrypt.hash(requestPass, salt)

  const beRequest = await User.findOne({ email: requestEmail, username: requestUsername})
  if (!beRequest) {
    res.send({error: 'The information provided was not related to an account on the server.'})
  } else {
    res.nid = beRequest._id
    console.log(beRequest)
    const newRequest = await User.findByIdAndUpdate(res.nid, {password: hashPass})
    res.send({staus: 'Reset Success'})
    
  }
})

module.exports = router;