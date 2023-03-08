const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.render('register'));


//formularios page

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.get('/protegida', ensureAuthenticated, (req, res) => res.render('protegida'));

router.get('/recuperacao', (req, res) => res.render('recuperacao'));

router.get('/redefinicao', (req, res) => res.render('redefinicao'));


module.exports = router;