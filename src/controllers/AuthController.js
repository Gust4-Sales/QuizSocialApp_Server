const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(id) {
    const token = jwt.sign({ id }, '263f196d308a631b35f3cf171593439a', {
        expiresIn: 86400 //Um dia 
    }); //quizapptemp

    return token
}

module.exports = {
    async register(req, res) {
        const { userName } = req.body;

        try {
            if (await User.findOne({ userName }))
                return res.status(400).send({ error: "Usuário já cadastrado." });

            const user = await User.create(req.body);
            user.password = undefined;

            return res.send({ 
                user,
                token: generateToken(user._id)
            });
        } catch(err){
            console.log(err);
            
            return res.status(400).send({ error: "Não foi possível cadastrar o usuário. Tente novamente." });
        }
    },

    async authenticate(req, res) {
        const { userName, password } = req.body;

        try {
            const user = await User.findOne({ userName }).select('+password');

            if (!user)
                return res.status(404).send({ error: "Usuário não encontrado." });

            if (!await bcrypt.compare(password, user.password))
                return res.status(400).send({ error: "Senha inválida." });

            user.password = undefined;

            

            return res.send({ 
                user, 
                token: generateToken(user._id)
            });
        } catch (err){
            return res.status(400).send({ error: "Não foi possível logar. Tente novamente." });
        }
    }
}