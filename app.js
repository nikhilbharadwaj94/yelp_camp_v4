var express= require("express");
var app=express();
var bodyParser= require("body-parser");
//The first thing we are starting with in V2 is that we are adding a database and so we will need to do npm install --save mongooses
var mongoose = require("mongoose"),
    Campground = require("./models/campground.js"),
    seedDB = require("./seeds"),
    Comment = require("./models/comment"); //we need to require it to get an instance of the collection comment from the DB

//We are creating a new db called yelp_camp and we are connecting to it
mongoose.connect("mongodb://localhost/yelp_camp");


app.use(bodyParser.urlencoded("extended: true"));
app.set("view engine", "ejs");

//we want to seed the DB with some data to check it out. so we will be calling the seed DB function below.
seedDB();


//here i will be giving the root path
app.get("/", function(req,res){
    res.render("landing");
});

//here i will be setting the route to campgrounds page and also send the data that should be
// displayed in the form of an array of objects
app.get("/campgrounds", function(req,res){

    //in this version of the code we will be retrieving all the records from the database and then send them to in the render function
    Campground.find({}, function(err, foundCampgrounds){
        if(err){
            console.log("something went wrong!!");
        }else{
            res.render("campgrounds/index", {campgrounds:foundCampgrounds});
        }
    });     
   
});

//We will now add a Post route to let the user add new campgrounds to the database
app.post("/campgrounds", function(req,res){
    //IMPORTANT NOTE- WHENEVER WE DEAL WITH POST ROUTES WE NEED TO DO NPM INSTALL BODY_PARSER OTHERWISE WE WILL GET ERROR
    //get data from form and add to campgrounds array
    var name=req.body.name;
    var image= req.body.image;
    var description= req.body.description;
    var newCampground = {name: name, image: image, description: description};
    
    //Another major cange we will be doing in version 2 is that we will be adding the newCampground info into DB instead of array
    Campground.create(newCampground, function(err,campground){
        if(err){
            console.log(err);
        }else{
            console.log("new campground added to the DB : "+ campground);
        }
    })
    //redirect back to the campgrounds page
    res.redirect("/campgrounds");
});

//Now we will be adding a route to display form when we want to create a new campground
//Create route
//Always make sure that Create route is defined FIRST and Show route is defined SECOND
app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
});

//We will now add a SHOW route
//Whenever we have an object which contains references of other objects within them
// we need to use the .populate and .exec functionalities as shown below.
app.get("/campgrounds/:id", function(req,res){
    //find the campground with the particular id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        //render the page to show more information related to found record
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });  
});
//=====================================================================
//          Comments PATHS
//=====================================================================

app.get("/campgrounds/:id/comments/new", function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

app.post("/campgrounds/:id/comments", function(req,res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, FoundCampground){
        if(err)
        {
            console.log(err);
        }else{
            //create a new comment
            Comment.create(req.body.comment, function(err, comment){
                //Here req.body.comment is the comment object we are sending back via POST route. comment inside function()
                //is the newly created comment we are going to use to push into the campgrounds page
                if(err){
                    console.log(err);
                }else{
                    //connect new comment to campground
                    FoundCampground.comments.push(comment);
                    FoundCampground.save();
                    //redirect to campground homepage
                    res.redirect("/campgrounds/"+ FoundCampground._id);
                }
            })
        }
    }) 
});



//=====================================================================
//here i will be setting the app to listen to the port 4000
app.listen(4000, function(req,res){
    console.log("the application is listening on port 4000");
});