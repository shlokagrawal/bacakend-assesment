require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./database/database');
const upload = require('./fileupload')

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json())

// ROUTES
app.get("/", function (req,res) {
    res.redirect("/register");
});

app.get("/register", function (req, res) {
    res.render("userregistration");
});

app.get("/login", function (req, res) {
    res.render("login");
});

// Step 1: we will register the user using name, email, phone, and image (image will be uploaded)
app.post("/register",upload.single('image'),function (req,res) {

    // get all data from body
    const {username, email, password, phoneno} = req.body;
    const image = req.file;

    // all the data should exists
    if(!(username && email && password && phoneno && image)){
        res.status(400).send("All Fields Are Compulsary");
    }
    else{

    async function addUser(username, email, password, phoneno, image) {

        // encrypt the password.
        const encryptedPassword = await bcrypt.hash(password, 10);

        try {
            const user = new User({
                username: username,
                email: email,
                password: encryptedPassword,
                phoneno: phoneno,
                image: image
            })
            await user.save();
            res.send("User Registered Successfully!");
        } catch (error) {
            console.log(error);
        }
    }

    addUser(req.body.username, req.body.email, req.body.password ,req.body.phoneno, req.file.path);
    }
});

// Step 2: we will login the user using JWT token so once we hit login we should get back a jwt token with 1d validity.
app.post("/login", function (req, res) {
    try {
        // get all data from frontend
        const { email, password } = req.body;

        // find user in db, match the password and send token.
        async function matchingUserAndPassword(email, password) {
            const user = await User.findOne({ email });
            if (user && (await bcrypt.compare(password, user.password))) {

                // create JWT token with 1d validity.
                const token = jwt.sign(
                    { id: user._id },
                    process.env.JWTSECRET,
                    { expiresIn: '1d' }
                );

                user.password = undefined;
                res.status(200).json(token);
            }
        }

        matchingUserAndPassword(req.body.email, req.body.password);
    } catch (error) {
        console.log(error);
    }
})

// Step 3: There should be a route to edit profile details (update all the information like name, email, phone, and image)
app.patch("/users/:userName",upload.single('image'),function (req, res) {

    async function updateUser(userName) {
        const username = req.body.username;
        const email = req.body.email;
        const phoneno = req.body.phoneno;
        const updates = {
            username,
            email,
            phoneno
        };
        if (req.file) {
            const image = req.file.path;
            updates.image = image;
        }
        try {
            const result = await User.updateOne({ username: userName }, { $set: updates });
            res.send("User Updated: " + result.acknowledged)
        } catch (error) {
            console.log(error);
        }
    }

    updateUser(req.params.userName);

});

app.listen(3000, function() {
    console.log("Server Started at port 3000");
})