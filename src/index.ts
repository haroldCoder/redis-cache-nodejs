import axios from "axios";
import express from "express";
import responseTime from "response-time";
import {createClient} from "redis";
import dotenv from "dotenv"
import {promisify} from "util"

const app = express();
dotenv.config();

app.use(responseTime());

const client = createClient({
    url: process.env.URL_REDIS
})

const GET_ASYNC = promisify(client.get).bind(client)
const SET_ASYNC = promisify(client.set).bind(client)

client.on('error', err => console.log('Redis Client Error', err));
client.connect();

app.get("/characters", async(req, res)=>{
    client.get('characters')
    .then((data)=>{
        if(!data){
            console.log([]);
            res.json([]);
            return;
        }
        res.json(JSON.parse(data));
    })
    .catch((err)=>{
        console.log(err);
        res.send(err);
    })

    const response = await axios.get(`https://rickandmortyapi.com/api/character`);
    client.set('characters', JSON.stringify(response.data)).then(()=>{
        res.json(response.data);
    }).catch((err)=>{
        console.log(err);
    })
})


app.listen(1000, ()=>{
    console.log(`Server on port 1000`);
})