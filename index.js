import express from "express";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import pg from "pg"
import path from "path";
 
const port = 3000
const app = express()

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

app.get("/", (req, res)=>{
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
        if(userExist.rows.length > 0){
            res.send("Email already taken, try log in")
        }else{
            const result = await db.query("INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)", 
            [email, firstname, lastname, password]
            );
            console.log(result);
            res.render("login.ejs")
         }

   }
    catch (err){
        console.log(err)

    }
})



app.listen(port, ()=>{
    console.log(`The server is running on ${port}`)
})

