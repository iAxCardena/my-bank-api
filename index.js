import express from "express";
import accountsRouter from "./routes/accounts.js";
import { promises as fs } from "fs";
import winston from "winston";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import {swaggerDocument} from "./doc.js";

const { readFile, writeFile } = fs;

global.fileName = "accounts.json";  //variavel global para o nome do arquivo acessivel de todos os arquivos

const { combine, timestamp, label, printf } = winston.format;   //deconstruct das variaveis do winston
const myFormat = printf(({ level, message, label, timestamp }) => {     //determinando o formato de impressao do log
    return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({  //variavel global para o logger do app
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: "my-bank-api.log" })
    ],
    format: combine(
        label({ label: "my-bank-api" }),
        timestamp(),
        myFormat
    )
});

const app = express();
app.use(express.json());
/*CORS (Cross Origin Resource Sharing) eh um pacote que permite que paginas rosteadas em servidores diferentes a que esta API esta 
hospedada tenham acesso a ela*/
app.use(cors());    //declaracao do cors() de maneira global
/*Swagger eh uma ferramenta utilizada para documentacao. Eh declarado a rota (/doc), funcao
do swagger para servir um arquivo e qual arquivo sera servido */
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/account", accountsRouter);    //direciona para accounts.js

app.listen(3000, async () => {
    try {    //tenta ler o arquivo. se der erro, significa que nao existe logo, o arquivo eh criado
        await readFile(global.fileName);
        logger.info("API Started");
    } catch (err) {
        const inicialJson = {
            nextId: 1,
            accounts: []
        };
        writeFile(global.fileName, JSON.stringify(inicialJson)).then(() => {
            logger.info("File created and API Started");
        }).catch(err => {
            logger.error(err);
        });
    }
});
