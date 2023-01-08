const db = require('./db.js')
require('dotenv').config(); 
const express = require('express');
const router = express.Router();

//img upload
const uploadFile = (req, res) => {
    let sampleFile;
    let uploadPath;
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return "";
    }
    
    sampleFile = req.files.image;
    
    let path = "/assets/img/uploads/" + sampleFile.name;
    uploadPath = __dirname + path;
  
    sampleFile.mv(uploadPath, function (err) {
      if (err) return res.send(err);
  
      console.log("File uploaded!");
    });
    return path;
};




// Login code
router.post('/login', (req, res) => {
    const {email,password} = req.body;    

    db.query(`SELECT * FROM students WHERE email = '${email}'`, (err, results) => {
    if (err) {
    return res.send({ message: 'Error finding student' });
    }
    if (results.length === 0) {
    return res.send({ message: 'Student not found' });
    }
    const user = results[0];
    if (password !== user.password) {
    return res.send({ message: 'Incorrect password' });
    }    
    res.send({ message: "Login Approved" });
    });
});



// SignUp code
router.post('/signup', function(req,res){
    let { email,password,fullName,contact } = req.body 
    
    db.query(`SELECT * FROM students WHERE email = '${email}'`, (err, results) => {
    if (err) {
    return res.send({ message: 'Error finding student',err });
    }
    if (results.length > 0) {
    return res.send({ message: 'Student already exists' });
    }
    let image = uploadFile(req);
    db.query(`INSERT INTO students (email, password, full_name, contact, image) VALUES ('${email}', '${password}', '${fullName}', '${contact}', '${image}')`, (err, result) => {
    if (err) {
    return res.send({ message: 'Error saving student',err });
    }
    res.send({ message: { id: result.insertId, email: email, fullName: fullName, contact: contact, image: image } });
    });
    });
});



// Get all User Profile 
router.get('/',function (req,res){
    let data = [];
    db.query(`SELECT * FROM students `, (err, results) => {
    if (err) {
    return res.send({ message: 'Error finding student',err });
    }
    if (results.length > 0) {         
        results.map((result)=>{
            data.push({id: result.id, email: result.email, fullName: result.full_name, contact: result.contact, image: result.image})
        });       
    return res.send({ message: data });
    }
    if(results.length ==0){
    return res.send({ message: 'No Student in database ' });
    }
    })
});

// Post updates Api
router.post('/:id/updates', function(req,res){
    let comment = req.body.comment;
    let user_id = req.params.id;
           
    let image = uploadFile(req);
    if(image == ""){
    return res.send({ message: 'There is no image file attached' });
    }
    db.query(`INSERT INTO updates (user_id, image, comment) VALUES ('${user_id}', '${image}', '${comment}')`, (err, result) => {
    if (err) {
    return res.send({ message: 'Error saving updates',err });
    }
    res.send({ message: { photo_id: result.insertId, id: user_id, comment: comment, image: image } });
    });
});

// Post likes Api
router.post('/:id/likes', function(req,res){
    
    let user_id = req.params.id; //student id
    let update_id = req.body.photo_id;   // photo id in updates
    
    if(!user_id && !update_id){
    return res.send({ message: 'Error finding id and photo_id' })
    }
    
    db.query(`SELECT * FROM likes WHERE user_id = '${req.params.id}' and update_id = '${update_id}'`, (err, results) => {
        if (err) {
        return res.send({ message: 'Error in Backend',err });
        } 
        if(results.length>0){        
        return res.send({message: "Student already liked this photo"});
        }else {

            db.query(`INSERT INTO likes ( user_id, update_id, likes) VALUES ('${user_id}', '${update_id}', '1')`, (err, result) => {
                if (err) {
                return res.send({ message: 'Error saving likes',err });
                }    
                    var sql = "UPDATE updates SET like_count = like_count + 1 WHERE photo_id = '"+update_id+"'";

                    db.query(sql, (err, result) => {
                        if (err) {
                        return res.send({ message: 'Error saving likes',err });
                        }
                        //res.send({ message: result });
                    });   

                res.send({ message: { likes_id: result.insertId, id: user_id, photo_id: update_id, likes: 1 } });

            });

        }
    })

    


});


// news Feed
router.get('/news', function(req,res){
    
    let data = [];

    db.query('SELECT * FROM updates ORDER BY photo_id ASC',(err, results) => {
        if (err) {
        return res.send({ message: 'Error in Backend',err });
        } 
        //console.log(results)                           
        return res.send({message: results})  
     });

})


//specific User Profile with id
router.get('/:id',function (req,res){

    db.query(`SELECT * FROM students WHERE id = '${req.params.id}'`, (err, results) => {
    if (err) {
    return res.send({ message: 'Error finding student',err });
    }
    if (results.length > 0) {        
    return res.send({ message: {id: results[0].id, email: results[0].email, fullName: results[0].full_name, contact: results[0].contact, image: results[0].image} });
    }
    if(results.length ==0){
    return res.send({ message: 'No Student with given id '+req.params.id });
    }
    })
});





module.exports = router;