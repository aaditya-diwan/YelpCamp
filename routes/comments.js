var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/",isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           //If there is a error retrun to the camgrounds
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           //Else create a comment and save it to the database.
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
                console.log("The cuurent comment is written by : " + req.user.username);
               //save the comment
               comment.save();
               campground.comments.push(comment);
               console.log(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

//EDIT ROUTE FOR THE COMMENT 
router.get("/:comment_id/edit",isLoggedIn, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else {
         res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
       }
    });
 });

 //COMMENT UPDATE
 router.put("/:comment_id",checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment ,function(err,updatedComment){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
 })

//COMMENT DELETE
 router.delete("/:comment_id",checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err,toDeleteComment){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
 })


//Middleware.
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                res.redirect("back");
            }
            else{
                if(foundComment.author.id.equals(req.user._id) ){
                    next();
                }else{
                    res.redirect("back");
                }
                
            }

        }); 
    }
else{
    res.redirect("back");       
}   
}
module.exports = router;
