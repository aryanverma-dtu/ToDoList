//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemSchema = new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemSchema);

const def1 = new Item({
name:"Welcome to your To-Do List"
});

const def2 = new Item({
  name:"Hit the + button to add a new item"
});

const def3 = new Item({
  name:"<-- hit this to delete an item"
});
const defArr = [def1,def2,def3];

const ListSchema = new mongoose.Schema({
  name: String,
  items : [itemSchema]
});

const List = new mongoose.model("List",ListSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




app.get("/", function(req, res) {
  
  
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defArr,(err)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log("success");
          res.redirect("/");
        }
      });
    }
    else{
      res.render("list", {listTitle: "Today", newListItems:foundItems});
    }
    
  });


  

});

app.post("/", function(req, res){

  const itemcurr = req.body.newItem;
  const list = req.body.list;
  const newOne = new Item({
    name:itemcurr
  });
 if(list==="Today"){
   newOne.save();
   res.redirect("/");
 }
 else{
   List.findOne({name:list},function(err,foundIt){
     foundIt.items.push(newOne);
     foundIt.save();
     res.redirect("/"+list);
   });
 }
  });
  


app.post("/delete",function(req,res){

  const toDel = (req.body.checkbox);
  const list = req.body.listName;
  if(list=="Today"){
    Item.findByIdAndRemove(toDel,function(err){
      if(err){
        console.log(err);
      }
      res.redirect("/");
  });
}
else{
  List.findOneAndUpdate({name:list},{$pull:{items:{_id:toDel}}},function(err,foundList){
    if(!err){
      res.redirect("/" + list);
    }
  });
}
    
  
  
});

app.get("/:listName",function(req,res){
  const customListName = (req.params.listName);
  
  List.findOne({name:customListName},function(err,foundList){
    if(!foundList){
      const newList = new List({
        name : customListName,
        items : defArr
      });
      newList.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: customListName, newListItems:foundList.items});
      
    }
  });
  
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
