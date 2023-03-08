const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require("nodemailer");
const randToken = require('rand-token');

//User Model
const User = require('../models/User');
const { ensureAuthenticated } = require('../config/auth');

//Get routes
router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.get('/protegida', ensureAuthenticated, (req, res) => res.render('protegida'));

router.get('/recuperacao', (req, res) => res.render('recuperacao'));

router.get('/redefinicao', (req, res) => res.render('redefinicao'));


//Register Handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;


    //Check required fields

    if (!name || !email || !password || !password2) {
        res.send('Por favor, preencha todos os campos.')
    }

    //Check password match

    if (password !== password2) {
        res.send('As senhas não são iguais.')
    }

    //Check password length

    if (password.length < 6) {
        res.send("Senha deve conter mais de 6 caracteres");
    }
    else {
        //validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                //User exists
                res.send('Email já cadastrado.');
                res.render('register', {
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                //Hash password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;

                        //Set password to hashed
                        newUser.password = hash;
                        //Save user
                        newUser.save()
                            .then(user => {
                                res.redirect('/users/login');


                            })
                            .catch(err => console.log(err));
                    })

                )
            }
        });
    }

});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/protegida',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


//Forgot password
router.post('/recuperacao', async (req, res) => {
    // Verifica se o email foi fornecido
    if (!req.body.email) {
        return res.status(400).send('Informe o email');
    }

    try {
        // Procura o usuário no banco de dados
        const user = await User.findOne({ email: req.body.email });

        // Verifica se o usuário existe
        if (!user) {
            return res.status(400).send('Nenhum usuário encontrado com esse email');
        }

        // Gera um token aleatório
        const token = randToken.generate(20);


        // Cria uma data de expiração para o token (1 hora a partir de agora)
        const expiration = Date.now() + 3600000;

        // Salva o token e a data de expiração no banco de dados
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiration;
        await user.save();


        // Cria uma função para enviar o email
        const email = require('../config/keys').email;
        const senha = require('../config/keys').senha;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: senha,
            },
        });

        const mailOptions = {
            from: 'emailsuporte@gmail.',
            to: user.email,
            subject: 'Link para redefinir a senha',
            text:
                'Você está recebendo esse email porque você (ou alguém) solicitou a redefinição da senha da sua conta.\n\n'
                + 'Clique no link abaixo, ou cole-o em seu navegador para completar o processo:\n\n'
                + 'http://'
                + req.headers.host
                + '/reset/'
                + token
                + '\n\n'
                + 'Se você não solicitou a redefinição da senha, ignore esse email e sua senha permanecerá inalterada.\n',
        };

        // Envia o email
        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Erro ao enviar email');
            }
            return res.status(200).send('Email enviado com sucesso');
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Erro ao enviar email');
    }
})


router.post('/redefinicao', async (req, res) => {
    // Verify that a token and new password were provided in the request body
    if (!req.body.password) {
        return res.status(400).send('Missing token or new password');
    }

    try {
        // Find the user in the database using the token
        const user = await User.findOne({ resetPasswordToken: req.body.token });

        // Verify that the user exists and that the token has not expired
        if (!user || Date.now() > user.resetPasswordExpires) {
            return res.status(400).send('Invalid token or token has expired');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Send a response indicating that the password reset was successful
        return res.status(200).send('Password reset successful');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error resetting password');
    }
});






























module.exports = router;