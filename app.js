const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

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

const authorSchema = {
  authorName: String,
  authorBio: String,
  authorImage: String,
  authorBatch: Number
};

const Article = mongoose.model("Article", articleSchema);
const Author = mongoose.model("Author", authorSchema);

app.get("/", function(req, res){
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  Article.find({month: currentMonth, year: currentYear}, function(err, results){
    if(err){
      console.log(err);
    }else{
      res.render("home", {
        pageTitle: "New Articles",
        articles: results
      });
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const articleDetails = new Article({
    title: req.body.title,
    author: _.camelCase(req.body.authorName),
    content: req.body.content,
    imageUrl: req.body.image,
    genre: _.camelCase(req.body.genre),
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

app.get("/articles/:articleId", function(req, res){
  const articleId = req.params.articleId;

  Article.findOne({_id: articleId}, function(err, result){
    if(err){
      console.log(err);
    }else{
      res.render("post", {result: result});
    }
  });
});

app.get("/genres/:genre", function(req, res){
  const genre = req.params.genre;

  Article.find({genre: genre}, function(err, results){
    if(err){
      console.log(err);
    }else{
      res.render("home", {pageTitle: _.startCase(genre), articles: results});
    }
  });
});

app.get("/createAuthor", function(req, res){
  res.render("create-author");
});

app.post("/createAuthor", function(req, res){
  const authordetails = new Author({
    authorName: _.camelCase(req.body.authorName),
    authorBio: req.body.authorBio,
    authorImage: req.body.authorImage,
    authorBatch: req.body.authorBatch
  });

  authordetails.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/authors");
    }
  });
});

app.get("/authors", function(req, res){
  Author.find({}, function(err, results){
    if(err){
      console.log(err);
    }else{
      res.render("authorsList", {authors: results});
    }
  });
});

app.get("/authors/:authorId", function(req, res){
  const authorId = req.params.authorId;

  Author.findOne({_id: authorId}, function(err, result){
    if(err){
      console.log(err);
    }else{
      if(result){
        Article.find({author: result.authorName}, function(error, works){
          if(!err){
            res.render("author", {result: result, name: _.startCase(result.authorName), works: works});
          }
        });
      }
    }
  });
});


app.listen(3000, function(){
  console.log("Server is up and running");
})
