//appmirror.js
require("dotenv").config();

const mongoose = require("mongoose");

const express = require("express");
const bodyparser = require("body-parser");
const { Signup, Login, updateUser, getUser, deleteUser, ChangePassword, forgetpassword} = require("./system");
const Middlewareauthentication = require("./middleware/auth")
const app = express();
const PORT = process.env.PORT;

//midleware to parse JSON request bodies
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json()); 

//defining routes

app.post("/signup", Signup);
app.post("/login", Login);
app.get("/user/:UID", getUser);
app.patch("/user/:UID", Middlewareauthentication, updateUser);
app.delete("/user/:UID",Middlewareauthentication, deleteUser);
app.patch("/user/:UID/Changepassword", ChangePassword)
app.post("/user/:email/forgetpassword", forgetpassword)

// Handle 404 Not Found error

app.use((req, res) => {
     res.status(404).send("Not Found")
});



mongoose.connect("mongodb://127.0.0.1:27017/hic")
.then((done)=>{
    console.log("db connection is successful")

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    
})
.catch((err)=>{
    console.log(`An error occurred, hence server was unable to start. ${err} `)
})