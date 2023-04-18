const multer = require('multer');
const path = require('path');

// Image File Storage Setting
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
module.exports = multer({ storage: storage })