var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser= require('body-parser');
var ObjectId=require('mongodb').ObjectId;
var bcrypt=require('bcryptjs');
var jwt=require('jwt-simple');
var JWT_SECRET='catsmeow';
var app=express();
app.use(bodyParser.json());
app.use(express.static('public'));
var db=null;


MongoClient.connect("mongodb://localhost:27017/test", function(err,dbconn) {
 if(!err)
 {
 console.log("Connected successfully to server");
 db=dbconn;
 }
 });

app.get('/meows',function(req,res,next)
{

db.collection('meows',function(err,meowscollection){
meowscollection.find().toArray(function(err,meows)
{
return res.json(meows);

});
});
});

app.post('/meows',function(req,res,next)
{
var token=req.headers.authorization;
var user=jwt.decode(token,JWT_SECRET);
db.collection('meows',function(err,meowscollection){
  var newMeow = {
    text:req.body.newMeow,
    user:user._id,
    username:user.username
  };


meowscollection.insert(newMeow,{w:1},function(err)
{
return res.send();
});
});

res.send();
});

app.put('/meows/remove',function(req,res,next)
{
  var token = req.headers.authorization;
  var user = jwt.decode(token,JWT_SECRET);

db.collection('meows',function(err,meowsCollection)
{

var meowId=req.body.meow._id;

console.log(meowId);
console.log(user._id);
meowsCollection.remove({_id: ObjectId(meowId),user:user._id},{w:1},function(err,result)
{
 return res.send();
});
});

});

app.post('/users',function(req,res,next){
db.collection('users',function(err,usersCollection){
  bcrypt.genSalt(10, function(err,salt){
    bcrypt.hash(req.body.password, salt, function(err,hash){
      var newUser={
        username:req.body.username,
        password:hash,
        email:req.body.email,
        mobile:req.body.mobile
    };

usersCollection.insert(newUser,function(err)
{
return res.send();
});
});

});
});
});


app.put('/users/signin',function(req,res,next){
db.collection('users',function(err,usersCollection){
  usersCollection.findOne({username:req.body.username},function(err,user)
  {
bcrypt.compare(req.body.password, user.password, function(err , result){
  if(result){
    var token=jwt.encode(user,JWT_SECRET);

    return res.json({user:user,token:token});
    //return res.json(user);

  }
  else{
 return res.status(400).send();
  }
});
  });

  bcrypt.genSalt(10, function(err,salt){
    bcrypt.hash(req.body.password, salt, function(err,hash){
      var newUser={
        username:req.body.username,
        password:hash
    };

usersCollection.insert(newUser,function(err)
{
return res.send();
});
});

});
});
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
