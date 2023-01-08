       
const mysql = require('mysql2');

//DB configuration 
var con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Ripu@123",
    database: "collegeDB"
});

module.exports= con;
