//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://ansuman:digestive@cluster0.me5ux.mongodb.net/listDB", {useNewUrlParser: true});
//create a schema
const itemSchema = {
  name: String
};

//create a model
const Item = mongoose.model("Item", itemSchema);

//create a document
const item1 = new Item({name: "Welcome To Your To-Do-List"});
const item2 = new Item({name: "Hit the + button to add a new item"});
const item3 = new Item({name: "<-- Hit this to delete an item"});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved the default array");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });
});

app.get("/:CustomlistName", function(req, res) {
  const customList = req.params.CustomlistName;

  List.findOne({
    name: customList
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({name: customList, items: defaultArray});
        list.save();
        path = "/" + customList;
        res.redirect(path);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })
});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({name: itemName});
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res) {
  const itemID = req.body.checkbox;
  const listName = req.body.listname;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemID, function(err) {
      if (!err) {
        console.log("Item Deleted");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started on port successfully");
});
