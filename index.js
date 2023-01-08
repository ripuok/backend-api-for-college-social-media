const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const user = require("./user");
const fileUpload = require('express-fileupload');

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()); // json to be used

app.use(cors()); // for cross platform usage 

app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
}));

app.use('/student', user);

const PORT = process.env.PORT || 4000; //either cloud port or local port

app.listen(PORT,()=>{
    console.log("Server Running at port: "+PORT);
});
