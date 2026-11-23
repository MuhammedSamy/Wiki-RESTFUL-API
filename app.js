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

const databaseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wikiDB";

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);


function readArticleFields(body, rejectUnknown = false) {
  const entries = Object.entries(body);
  const fields = entries.filter(([key]) => key === "title" || key === "content");
  if (fields.length === 0 ||
      fields.some(([, value]) => typeof value !== "string") ||
      (rejectUnknown && fields.length !== entries.length)) {
    return null;
  }
  return Object.fromEntries(fields);
}

app.route("/articles")
  .get(async function(req, res, next) {
    try {
      res.send(await Article.find({}));
    } catch (err) {
      next(err);
    }
  })
  .post(async function(req, res, next) {
    const fields = readArticleFields(req.body);
    if (!fields) return res.status(400).send("Invalid article");
    try {
      await Article.create(fields);
      res.send("successfully added post");
    } catch (err) {
      next(err);
    }
  })
  .delete(async function(req, res, next) {
    try {
      await Article.deleteMany({});
      res.send("Sucessfully delete all posts");
    } catch (err) {
      next(err);
    }
  });

app.route("/articles/:articleTitle")
  .get(async function(req, res, next) {
    try {
      const article = await Article.findOne({title: req.params.articleTitle});
      if (!article) return res.status(404).send("No article was found");
      res.send(article);
    } catch (err) {
      next(err);
    }
  })
  .put(async function(req, res, next) {
    const fields = readArticleFields(req.body);
    if (!fields) return res.status(400).send("Invalid article");
    try {
      const result = await Article.replaceOne({title: req.params.articleTitle}, fields, {runValidators: true});
      if (!result.matchedCount) return res.sendStatus(404);
      res.send("successfully updated article");
    } catch (err) {
      next(err);
    }
  })
  .patch(async function(req, res, next) {
    const fields = readArticleFields(req.body, true);
    if (!fields) return res.status(400).send("Invalid article");
    try {
      const result = await Article.updateOne({title: req.params.articleTitle}, {$set: fields}, {runValidators: true});
      if (!result.matchedCount) return res.sendStatus(404);
      res.send("Successfully updated article");
    } catch (err) {
      next(err);
    }
  })
  .delete(async function(req, res, next) {
    try {
      const result = await Article.deleteOne({title: req.params.articleTitle});
      if (!result.deletedCount) return res.sendStatus(404);
      res.send("Successfully deleted article");
    } catch (err) {
      next(err);
    }
  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

mongoose.connect(databaseUri)
  .then(() => app.listen(port, () => console.log("Server started successfully")))
  .catch(err => {
    console.error("MongoDB connection failed", err.name);
    process.exitCode = 1;
  });
