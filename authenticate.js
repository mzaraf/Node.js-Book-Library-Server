const fs = require('fs');
const path = require('path');

const usersDbPath = path.join(__dirname, "db", 'users.json');

function getAllUsers() {
    return new Promise((resolve, reject)=> {
        fs.readFile(usersDbPath, "utf8", (err, users)=> {
            if(err){
                reject(err)
            }
            
            resolve(JSON.parse(users))
        })
    })
}

function authenticateUser(req, res) {
    return new Promise((resolve, reject) => {
        const body= []
        
        req.on("data", (chunk) => {
            body.push(chunk)
        })

        req.on("end", async()=> {
            const parsedBody = Buffer.concat(body).toString()

            if(!parsedBody){
                reject("No username or password provided")
            }

            let loginDetails;
            try{
                loginDetails = JSON.parse(parsedBody)
            } catch (error){
                reject("Invalid user details provided")
                return
            }

            if (!loginDetails.username || !loginDetails.password) {
                reject("Username or password missing")
                return;
            }

            const users = await getAllUsers()
            const userFound = users.find((user)=>{
                return user.username === loginDetails.username
            })
            if(!userFound){
                reject("User not found. Please Register a user")
                return
            }
            if(userFound.password !== loginDetails.password){
                reject("Invalid username or password!")
                return
            }

            resolve()
        })
    })
}


module.exports = {
    authenticateUser
}