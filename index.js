import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";

const port = 3000;
const app = express();
var currentID = null;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Books summary project",
    password: *****,
    port: ****,
});
db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

app.get("/", async (req,res)=>{
    const response = await db.query("SELECT * FROM books");
    const sortedData = sortData(response.rows);
    res.render("index.ejs",{data: sortedData});
});

app.get("/update/:id",(req,res)=>{
    currentID = req.params.id;
    res.render("update.ejs");
});
app.post("/update/:id", async (req,res)=>{
    const newRating = parseFloat(req.body.rating);
    const newReview = req.body.review;
    if(req.body.rating.length===0 || newReview.length===0){
        res.send("<h1>Please fill all details</h1>");
    }
    else{
        await db.query("UPDATE books SET rating = $1, review = $2 WHERE id = $3",[newRating,newReview,currentID]);
        res.redirect("/");  
    }
});

app.get("/new",(req,res)=>{
    res.render("new.ejs");
});
app.post("/new", async (req,res)=>{
    const newBookName = req.body.bookName;
    const newRating = parseFloat(req.body.rating);
    const newReview = req.body.review;
    const newOLID = req.body.olid;
    const response = await axios.get("https://covers.openlibrary.org/b/olid/"+req.body.olid+"-M.jpg");
    if(req.body.rating.length===0 || newBookName.length===0 || newReview.length===0){
        res.send("<h1>Please fill all the details</h1>");
    }
    else if(response.data[0]==="G"){
        res.send("<h1>Invalid OLID</h1>");
    }
    else{
        await db.query("INSERT INTO books (bookcover_olid, rating, review, book_name) VALUES ($1,$2,$3,$4)",[newOLID,newRating,newReview,newBookName]);
        res.redirect("/");
    }
});

app.post("/delete/:id", async (req,res)=>{
    await db.query("DELETE FROM books WHERE id = $1",[req.params.id]);
    res.redirect("/");
});

app.listen(port,()=>{
    console.log(`Server running on port: ${port}`);
});


function sortData(arr){
    for(var i=1;i<arr.length;i++){
        for(var j=0;j<i;j++){
            if(arr[i].rating>arr[j].rating){
                arr.splice(j,0,arr[i]);
                arr.splice(i+1,1);
                break;
            }
        }
    }
    return arr;
}
