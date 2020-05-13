const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.use(session({
  secret: "Natsu Dragneel Is The Best.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/magazineDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

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

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

adminSchema.plugin(passportLocalMongoose);

// const editorSchema = new mongoose.Schema({
//   username: String,
//   password: String
// });

// editorSchema.plugin(passportLocalMongoose);

const Article = mongoose.model("Article", articleSchema);
const Author = mongoose.model("Author", authorSchema);
const Admin = mongoose.model("Admin", adminSchema);
// const Editor = mongoose.model("Editor", editorSchema);

passport.use(Admin.createStrategy());

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

// passport.use(Editor.createStrategy());
//
// passport.serializeUser(Editor.serializeUser());
// passport.deserializeUser(Editor.deserializeUser());

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
  if(req.isAuthenticated()){
    res.render("compose");
  }else{
    res.redirect("/adminLogin");
  }
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
  if(req.isAuthenticated()){
    res.render("create-author");
  }else{
    res.redirect("/adminLogin");
  }
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

app.get("/createAdmin", function(req, res){
  if(req.isAuthenticated()){
    res.render("registerAdmin");
  }else{
    res.redirect("/adminLogin");
  }
});

app.post("/createAdmin", function(req, res){
  Admin.register({username: req.body.username}, req.body.password, function(err, admin){
    if(err){
      console.log(err);
      res.redirect("/createAdmin");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  });
});

app.get("/adminLogin", function(req, res){
  res.render("adminLogin");
});

app.post("/adminLogin", function(req, res){
  const newAdmin = new Admin({
    username: req.body.username,
    password: req.body.password
  });

  req.login(newAdmin, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
      });
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(3000, function(){
  console.log("Server is up and running");
})
