var express = require('express');
var router = express.Router();
const {getAruba,getOnlineEmployees} = require('../controllers/aruba.controller')

router.get('/',getAruba ); 
router.get('/employee',getOnlineEmployees ); 

module.exports = router;
