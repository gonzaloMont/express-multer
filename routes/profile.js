var express = require('express');
var router = express.Router();
const multer  = require('multer')
const path = require('path');
const fs = require('fs'); 

//const upload = multer({ dest: 'uploads/' })



// Configure storage settings
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        // Get the original filename without extension
        const filename = path.parse(file.originalname).name;
        // Get original file extension
        const ext = path.extname(file.originalname);
        // Create unique suffix using timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Combine everything into final filename: originalname-timestamp-random.ext
        cb(null, `${filename}-${uniqueSuffix}${ext}`);
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    // First check if a file already exists
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return cb(new Error('Error checking uploads directory'), false);
        }
        
        if (files.length > 0) {
            return cb(new Error('Badago fitxategiren bat igota. Fitxategi bakarra igotzea da posible.'), false);
        }

        // Check file type
        const allowedTypes = ['.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(ext)) {
            cb(null, true); // Accept file
        } else {
            cb(new Error('Bakarrik igo ahal dira PNG eta JPG formatuko fitxategiak!'), false);
        }
    });
};

// Configure multer with all options
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: fileFilter
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('form.html');
});


router.post('/',  upload.single('avatar'), function (req, res, next) {
    if (!req.file) {
        return res.status(400).send('Ez dago fitxategirik aukeratuta. Aukeratu fitxategi bat igotzeko.');
    }

    // Create the file URL
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    
    // Create HTML response with user info and clickable link
    const htmlResponse = `
        <h3>Upload Successful!</h3>
        <p>Zure izena: ${req.body.name}</p>
        <p>Fitxategia: <a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
    `;

    res.send(htmlResponse);
});

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));



// Error handling middleware
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('Fitxategiaren tamaina 2MB baino txikiagoa izan behar da');
        }
    }
    res.status(500).send(error.message);
});


module.exports = router;
