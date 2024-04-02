import express from "express";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"
import pg from "pg"
import path from "path";
 
const port = 3000
const app = express();
const saltRounds = 10;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "users",
    password: "Dkkande",
    port: 5432
})
db.connect();

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'));

app.get("/login", (req, res)=>{
    res.render("login.ejs")
});



app.get("/register", (req, res)=>{
    res.render("register.ejs")
});
app.post("/register", async(req, res)=>{
    const firstname = req.body.FName;
    const lastname = req.body.LName;
    const email = req.body.email;
    const password = req.body.password;
 

    try{
        const userExist = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        console.log(userExist)
        if(userExist.rows.length > 0){
            res.send("Email already taken, try log in")
        }else{
            //Hashing password
            bcrypt.hash(password, saltRounds, async(err, hash)=>{
                if(err){
                    console.log(err)
                }else{
                const result = await db.query("INSERT INTO users (email, firstname, lastname, password) VALUES ($1, $2, $3, $4)", 
            [email, firstname, lastname, hash]
            );
            console.log(result);
            res.render("login.ejs")
                }

            })
            
         }

   }
    catch (err){
        console.log(err)

    }
});

app.post("/login", async(req, res)=>{
    const email = req.body.loginEmail;
    const loginPassword = req.body.loginPassword;

    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[
            email,
        ]);
        console.log(result.rows)
        if(result.rows.length > 0){
            const user = result.rows[0];
            const storedpassword = user.password;

            bcrypt.compare(loginPassword, storedpassword, (err, result)=>{
                if(err){
                    console.log(err)
                }else{
                    if(result){
                        console.log(result)
                        res.send("Greae You're good to go..!")
                    }else{
                        res.send("Incorrect Email or Password, please try it again..!")

                    }
                }
            })

        }else{
            res.send("User not find..!")
        }
    }catch (err){
        console.log(err)

    }
   
})




app.listen(port, ()=>{
    console.log(`The server is running on ${port}`)
})

