import express from "express";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"
import pg from "pg"
import path from "path";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
 
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
//use Session for cookies
app.use(session({
    secret: "THESECRETWORD",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 48,
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res)=>{
    res.render("login.ejs")
});



app.get("/register", (req, res)=>{
    res.render("register.ejs")
});

app.get("/home", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("home.ejs")
    }else{
        res.redirect("/login")
    }

})

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

app.post("/login", passport.authenticate("local",{
    successRedirect: "/home",
    failureRedirect: "/login"
}));

passport.use(new Strategy(async function verify(username, password, cb){

    try{
        const result = await db.query("SELECT * FROM users WHERE email = $1",[
            username,
        ]);
        console.log(result.rows)
        if(result.rows.length > 0){
            const user = result.rows[0];
            const storedpassword = user.password;

            bcrypt.compare(password, storedpassword, (err, result)=>{
                if(err){
                 return cb(err)
                }else{
                    if(result){
                        return cb(null, user)
                        // console.log(result)
                        // res.send("Greae You're good to go..!")
                    }else{
                        return cb(null, false)
                        // res.send("Incorrect Email or Password, please try it again..!")

                    }
                }
            })

        }else{
            return cb("User not find..!")
        }
    }catch (err){
        return cb(err)

    }
}));

passport.serializeUser((user, cb)=>{
    cb(null, user)
})
passport.deserializeUser((user, cb)=>{
    cb(null, user)
})


app.listen(port, ()=>{
    console.log(`The server is running on ${port}`)
})

