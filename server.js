const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    Post = require("./models/post"),
    port = process.env.PORT || 5000;

const app = express();

let data =[{"id": 1, "body":"test1"},{"id": 2, "body":"test2"}, {"id": 3, "body": "test3"}];
let counter = 4;

// User body-parser to extract request body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Connect to mongoDB
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });

// Retrieve posts
app.get("/posts", (req, res) => {
    Post.find({}, (err, allPosts) => {
        if(err) {
            console.log(err);
            res.status(400).send(err.message);
        } else {
            res.json(allPosts);
        }
    });
});

// Create new post
app.post("/posts/new", (req, res) => {
    let postBody = req.body.postBody;

    // Add post to database
    Post.create({body: postBody}, (err, newPost) => {
        if (err) {
            console.log(err);
            res.status(400).send(err.message);
        } else {
            // Send new object back
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(newPost));
        }
    });
});

// Delete post
app.delete("/posts/:id", (req, res) => {
    Post.findOneAndDelete(req.params.id, (err) => {
        if(err) {
            console.log(err);
            res.status(400).send(err.message);
        } else {
            res.sendStatus(200);
        }
    });
});

// Update post
app.put("/posts/:id", (req, res) => {
    Post.findByIdAndUpdate(req.params.id, {body: req.body.postBody}, (err, updatedPost) => {
        if(err) {
            console.log(err);
            res.status(400).send(err.message);
        } else {
            res.sendStatus(200);
        }
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});