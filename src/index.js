import express from 'express';
import cors from 'cors';
import { Mongo } from '../database/mongo.js';
import { config } from 'dotenv';
import authRouter from '../src/auth/auth.js';

config();


async function main () {
  const hostname = 'localhost';
  const port = 3000;

  const app = express();

  const mongoConection = await Mongo.connect({
    mongoConectionString: process.env.MONGO_CS,
    mongoDbName: process.env.MONGO_DB_NAME
  });
console.log(mongoConection);

  app.use(express.json());
  app.use(cors());

  //030665

  app.get('/', (req, res) => {
    res.send({
        success: true,
        statuscode: 200,
        body: 'Welcome to my delivery API'
    });
  });

  app.use('/auth', authRouter);
  app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  })

}

main()