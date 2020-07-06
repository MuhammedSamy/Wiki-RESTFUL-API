const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);


////////////////////Request Targeting all articles//////////////////////
app.route("/articles")

.get(function(req, res) {
  Article.find({}, function(err, foundArticles) {
    if (!err) {
      res.send(foundArticles);
    } else {
      res.send(err);
    }
  });
})

.post(function(req, res) {
  console.log(req.body.title);
  console.log(req.body.content);
  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });
  newArticle.save(function(err) {
    if (!err) {
      res.send("successfully added post")
    } else {
      res.send(err);
    }

  });
})

.delete(function(req,res){
  Article.deleteMany({},function(err){
    if (!err){
      res.send("Sucessfully delete all posts");
    }else {
      res.send(err);
    }
  });
});

////////////Request targeting specific article//////////////////////

app.route("/articles/:articleTitle")

.get(function(req,res){
  Article.findOne({title: req.params.articleTitle} , function(err,foundArticle){
    if (foundArticle){
      res.send(foundArticle);
    }else {
      res.send("No article was found")
    }
  });
})

.put(function(req,res){
  Article.updateOne({title:req.params.articleTitle},
    {title:req.body.title,content: req.body.content},
    {overwrite:true},
    function(err){
      if(!err){
        res.send("successfully updated article");
        res.redirect("/"+req.body.title);
      } else{
        res.send(error);
      }


    }
  );
})

.patch(function(req,res){

  Article.updateOne(
    {title:req.params.articleTitle},
    {$set: req.body },
    function(err){
      if(!err){
        res.send("Successfully updated article");
        res.redirect("/"+req.body.title);
      }else{
        res.send(err);
      }
    }
  );
})

.delete(function(req,res){

  Article.deleteOne(
  {title: req.params.articleTitle},
  function(err){
    if(!err){
      res.send("Successfully deleted article");
      //res.redirect("/");
    }else{
      res.send(err);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}




app.listen(port, function() {
  console.log("Server started successfully");
});
