import express from 'express';
import passport from 'passport';
import localStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';


const collectionName = 'users';

passport.use(new localStrategy.Strategy({ usernameField: 'email' }, async (email, password, callback) => {
    const user = await Mongo.db
    .collectionName(collectionName)
    .findOne({ email: email });

    if (!user) {
        return callback(null, false, { message: 'Incorrect email or password.' });
    }

    const saltBuffer = user.salt.buffer;

    crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (err, hashedPassword) => {
        if (err) {
            return callback(null, false);
        }

    const userPasswordBuffer = Buffer.from(user.password.buffer);

    if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
        return callback(null, false, { message: 'Incorrect email or password.' });
    }

    const { password, salt, ... rest } = user;
    return callback(null, rest);
    })

}));    

const authRouter = express.Router();

authRouter.post('/singup', async (req, res) => {
    const checkUser = await Mongo.db.collection(collectionName).findOne({ email: req.body.email });

    if (checkUser) {
        return res.status(400).send({
            success: false,
            statuscode: 400,
            body: 'User already exists'
        });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({
                success: false,
                statuscode: 500,
                body: 'Internal server error'
            });
        }

        const result = await Mongo.db.collection(collectionName).insertOne({
            email: req.body.email,
            password: hashedPassword,
            salt: salt
        });

        if (result.insertId) {
            const user = await Mongo.db
            .collection(collectionName)
            .findOne({ _id: new ObjectId(result.insertId) });

            const token = jwt.sign(user, 'secret');

            return res.status.send({
                success: true,
                statuscode: 200,
                body: 'User created successfully',
                token: token,
                user,
                loggedIn: true
            });
        }
    })
})

authRouter.post('/login', (req, res) => {
    passport.authenticate('local', (error, user)  => {
        if (error) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: {
                    text: 'error during authentication',
                    error
                }
        })
    }

    if(!user) {
        return res.status(400).send({
                success: false,
                statusCode: 400,
                body: {
                    text: 'user not found',
                    error
                }
        })
    }
                
    const token = jwt.sign(user, 'secret')
     return res.status(200).send({
                success: true,
                statusCode: 200,
                body: {
                    text: 'user logged in successfully',
                    user,
                    token,
                    loggedIn: true
                }
        })(req, res);

    })

})   
export default authRouter;