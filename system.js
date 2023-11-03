
const fs = require("fs");
const validator = require( "email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const usermodel = require("./helper/DB.js")

var users = []; // Array to store signed-up names

var passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{6,16}$/

let validpassword = (password) => {
    return passwordRegex.test(password);
};

/*
fs.readFile("users.json", "utf8", (err, data) => {
    if(!err){
        try{
            let parsedData = JSON.parse(data);
            if(Array.isArray(parsedData)){
                users = parsedData;
            }
        } catch (error){
            console.error("error in parsing existing users:", error);
        }
    }
});

function bringUsertoFile(){
    fs.writeFile("users.json", JSON.stringify(users), "Utf8", (err)=> {
        if(err){
            console.error("There is error in bringing users to file:", err)
        }
    });
}
*/
function isEmailUnique(email){
    return !users.some((user) => user.email === email)// check if the email has not exist before(or email is unique)
};

function Signup(req, res) {

const data = req.body;


if (!data.name || !data.email || !data.password) {

res.status(400).json({error: "Name, Email & Password are required" });

return;
}

if(!validpassword(data.password)){
    res.status(400).json({error:"Valid Password is required"});

    return;
}

if(!validator.validate(data.email)){
    res.status(400).json({error: "Email is invalid"});

    return;
}

if(!isEmailUnique(data.email)){
    res.status(400).json({error:"Email already exist"});

    return;
}


//const PisMatched = bcrypt.compare(validpassword, hash)

// const salt = bcrypt.genSalt(13)
//    const hash =  bcrypt.hash(data.validpassword, salt)
//    console.log("hash is password:", hash)


// function RiD(){
//     return Math.floor(1000 + Math.random() * 9000)}
 
// var n = RiD();
// console.log(n)

const saltround = 13
bcrypt.hash(data.password, saltround, (err, hash) => {
    if(err){
        console.error("Error hasing password:", err);
        res.status(500).json({error: "internal server error"});
    } else {
        
var newUser = {
    name : data.name,
    email: data.email,
    password: hash
};

usermodel.create(newUser)
.then((done) => {

res.status(200).json({
    message: " Registeration is successful"
});
})
.catch((err)=> {
    

    res.status(500).json({
        message: " unable to register", err
    });
})

//users.push(newUser);
//bringUsertoFile();


//res.status(201).json({ detail: newUser, message: "Sign up successful by user" });
 }

});

}

function Login(req, res) {

    let data = req.body;
      
    
    if (!data.email || !data.password) {
      
    res.status(400).json({ error: "Email & Password are required" });
      
    return;
}
 const foundUser = users.find((user)=> user.email === data.email);

 if(foundUser){
bcrypt.compare(data.password, foundUser.password,(err, result) => {
    if(err){
        res.status(500).json({error: "incorrect password"});
    }else if(result){
        // Passwords match, generate a JWT token and send it in the response

        const token = jwt.sign(
            {UID : foundUser.UID, email: foundUser.email },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
            );

            res.status(200).json({data: foundUser, token, messag:"Login Sucessful"});
    }else{  res.status(401).json({error: "Login Failed"});
}
});
 }
 //else { res.status(401).json({error: "Email does not exist"});}



usermodel.findOne(foundUser)
.then((done) => {

    res.status(200).json({
        message: " login is successful"
    });
    })
    .catch((err)=> {
        
    
        res.status(500).json({
            message: " login not found", err
        });
    })

}
// Function to find a user by UID

function finduserId(req, res, next) {
 
    let UID = req.body._id;

  UID = usermodel.findOne(_id) 
  .then( (done)=> {

    if(done==null){
    
        res.status(404).json({
            message: "userUID not found"
        })

    //return users.find((user) => user._id === UID);
    }
    
  })
  .catch((err)=> {
        
    
    res.status(500).json({
        message: " login not found", err
    });
})
}
  // Route to get a user by UID

var getUser = (req, res)=>{
    const userUID = parseInt(req.params.UID);
    const user = finduserId(userUID);
 

    if(user){
        res.status(200).json(user)
    }else {
        res.status(404).json({error :" user on the data base does not exist"})
    }


};

// Route to update a user by UID

const forgetpassword = ( req, res)=>{
    const userEmail = req.body.email
    const user = userEmail
    const password = user.password
   console.log(user);

   if(!password){

    res.statu(400).json({error: "wrong password, "})

    if(user.email === user){

const newPassword = req.body

if(newData.password){
    user.password = newPassword.password;
   }
   usermodel.findOne({newPassword})
   .then((done) => {
   
       res.status(200).json({
           message: " password changed  successfully"
       });
       })
       .catch((err)=> {
           
       
           res.status(500).json({
               message: " passwordchanged failed", err
           });
       })
}
   

}


  // You can add more fields to update as needed
//bringUsertoFile();
//res.status(200).json({data: newData, message: "User updated successfully"})

}
const updateUser = (req, res)=>{
const userUID = parseInt(req.params.UID);
const user = finduserId(userUID);
console.log(user);

if(!user){
    res.statu(400).json({error: "User Not Found"})
    return
}

const newData = req.body;
if(newData.name){
    user.name = newData.name;

}
if(newData.email){
    user.email = newData.email;
}
if(newData.password){
    user.password = newData.password;
}

  // You can add more fields to update as needed
//bringUsertoFile();
res.status(200).json({data: newData, message: "User updated successfully"})
}

// Route to delete a user by UID

const deleteUser = (req, res)=>{
    const userUID = parseInt(req.params.UID);
    const unserIndex = users.findIndex((user) => user.UID === userUID);

    if(unserIndex === -1){
        res.status(400).json({error : "user not found"});

        return;
    }

    // remove the user from users array

    users.splice(unserIndex, 1);
    bringUsertoFile();
    
    res.status(200).json({message : "user successfully removed"}) // Respond with 204 (No Content) for a successful deletion
}

// rout to change user's password by UID

const ChangePassword = (req, res) => {
    const userUID = parseInt(req.params.UID);
    const user = finduserId(userUID);

    if(!user){
        res.status(401).json({error: "user not found"});

        return;
    }
    const data = req.body;

    if (!data.password) {

        res.status(401).json({error: "Password are required" });
        
        return;
        }
        
        if(!validpassword(data.password)){
            res.status(401).json({error:"Valid Password is required"});
        
            return;
        }



    if(!data){
        res.status(401).json({error: "New Password is required"});
        return;
    }

    const saltround = 13;
bcrypt.hash(data.password, saltround, (err, hashedPass)=>{
    if(err){
        res.status(500).json({error: "Password Hashing Error"})
    } else{
           // Update the user's password with the hashed password
           user.password = hashedPass
           bringUsertoFile();

           res.status(201).json({message: "Password Changed successfully"});
    }
});
};

module.exports = { 
    Signup, 
    Login, 
    updateUser, 
    getUser,
     deleteUser, 
     ChangePassword};
  