const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/magazineDB", {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = {
  title: String,
  author: String,
  content: String,
  imageUrl: String,
  genre: String,
  month: Number,
  year: Number
};

const Article = mongoose.model("Article", articleSchema);

app.get("/", function(req, res){
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  Article.find({month: currentMonth, year: currentYear}, function(err, results){
    if(err){
      console.log(err);
    }else{
      if(results){
        res.render("home", {
          pageTitle: "New Articles",
          articles: results
        });
      }
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const articleDetails = new Article({
    title: req.body.title,
    author: req.body.authorName,
    content: req.body.content,
    imageUrl: req.body.image,
    genre: req.body.genre,
    month: req.body.month,
    year: req.body.year
  });

  articleDetails.save(function(err){
    if(!err){
      res.redirect("/");
    }else{
      console.log(err);
    }
  });
});


app.listen(3000, function(){
  console.log("Server is up and running");
})
