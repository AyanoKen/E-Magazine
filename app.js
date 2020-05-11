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
  month: Number,
  year: Number
};

const Article = mongoose.model("Article", articleSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/compose", function(req, res){
  res.render("compose");
});


app.listen(3000, function(){
  console.log("Server is up and running");
})
