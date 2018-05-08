var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI , function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW
/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/contacts", function(req, res) {
    db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get contacts.");
      } else {
        res.status(200).json(docs);
      }
    });
  });
  
  app.post("/api/contacts", function(req, res) {
    var newContact = req.body;
  
    if (!req.body.name) {
      handleError(res, "Invalid user input", "Must provide a name.", 400);
    }
  
    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new contact.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  });

  /*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/api/contacts/:id", function(req, res) {
    db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get contact");
      } else {
        res.status(200).json(doc);
      }
    });
  });
  
  app.put("/api/contacts/:id", function(req, res) {
      
    console.log("Welcome PUT Method");

    var updateDoc = req.body;
    delete updateDoc._id;
  
    console.log(":doc>>"+ JSON.stringify(updateDoc));
    console.log(":id>>"+ updateDoc._id);
    console.log("req.params.id>>"+ req.params.id);

    // Method #1
    // Find note and update it with the request body
    // db.collection(CONTACTS_COLLECTION).update(
    //     { id: updateDoc.id },
    //     {
    //       name: updateDoc.name,
    //       email: updateDoc.email
    //     },
    //     { upsert: true }
    //  )

    // Method #2
    // db.collection(CONTACTS_COLLECTION).update(
    //     { id: updateDoc.id },
    //     {
    //         name: updateDoc.name,
    //         email: updateDoc.email
    //     },
    //     { upsert: true },
    //     function(err, doc) {
    //         if(err){
    //             handleError(res, err.message, "Failed to update contact");
    //         }else{
    //             updateDoc._id = req.params.id;
    //             res.status(200).json(updateDoc);
    //         }
    //     }
    //  );

    // Method #3
    // db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, 
    //         {$set:{name: updateDoc.name,
    //             email: updateDoc.email
    //         }},{ upsert: true }, function(err, doc) {
    //     if (err) {
    //       handleError(res, err.message, "Failed to update contact");
    //     } else {
    //       updateDoc._id = req.params.id;
    //       res.status(200).json(updateDoc);
    //     }
    // });

    // Method #4
    db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, 
            {$set:updateDoc},{ upsert: true }, function(err, doc) {
        if (err) {
          handleError(res, err.message, "Failed to update contact");
        } else {
          updateDoc._id = req.params.id;
          res.status(200).json(updateDoc);
        }
    });
    
    // db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    //     if (err) {
    //       handleError(res, err.message, "Failed to update contact");
    //     } else {
    //       updateDoc._id = req.params.id;
    //       res.status(200).json(updateDoc);
    //     }
    //   });

  });
  
  app.delete("/api/contacts/:id", function(req, res) {
    db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
      if (err) {
        handleError(res, err.message, "Failed to delete contact");
      } else {
        res.status(200).json(req.params.id);
      }
    });
  });