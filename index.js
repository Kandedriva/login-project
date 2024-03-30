import express from "express";
import { fileURLToPath } from "url";
import path from "path";


const port = 3000
const app = express()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res)=>{
    res.render("login.ejs")
})

app.get("/register", (req, res)=>{
    res.render("register.ejs")
})

app.listen(port, ()=>{
    console.log(`The server is running on ${port}`)
})