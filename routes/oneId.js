var express = require('express');
var router = express.Router();
const {authOne,accessToken} = require('../controllers/oneId.controller')

router.get('/login',authOne ); //http://localhost:3000/api/oneid/login
router.post('/',accessToken ); //http://localhost:3000/api/oneid/

module.exports = router;
