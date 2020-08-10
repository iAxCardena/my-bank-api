import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

//Adiciona uma conta no arquivo
router.post("/", async (req, res, next) => {
    // console.log(req.body);
    try {
        let account = req.body;

        if(!account.name || account.balance == null){   //impede que contas sem nome ou balanco sejam adicionadas
            throw new Error("Name e Balance sao obrigatorios");     //este erro vai para o catch(err) e o mesmo vai para o tratamento
        }

        const data = JSON.parse(await readFile(global.fileName));
        
        /*posiciona o ID da conta no comeco do objeto e especifica as chaves name e balance para que outras chaves informadas
        sejam ignoradas*/
        account = {      
            id: data.nextId++,
            name: account.name,
            balance: account.balance
        };

        data.accounts.push(account);

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(account);

        logger.info(`POST /account - ${JSON.stringify(account)}`);
    } catch (err) {
        next(err);
    }
});

//Le um arquivo e imprime na tela
router.get("/", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        
        delete data.nextId; //remove a propriedade nextId para nao ser impresso na busca
        
        res.send(data);

        logger.info(`GET /account`);
    } catch (err) {
        next(err);
    }
});

//Le um arquivo pelo ID e retorna o mesmo
router.get("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const account = data.accounts.find(account => {
            return account.id === parseInt(req.params.id);
        });

        res.send(account);

        logger.info(`GET /account/:id`);
    } catch (err) {
        next(err);
    }
});

//Filtra um arquivo por ID, removendo a conta que possui esse ID
router.delete("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));

        data.accounts = data.accounts.filter(account => account.id !== parseInt(req.params.id));

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.end();

        logger.info(`POST /account/:id - ${req.params.id}`);
    } catch (err) {
        next(err);
    }
});

/*router.put - utilizado para atualizar o recurso de forma integral, ou seja, o req.body que for pego, o registro antigo sera 
substituido completamente*/
//Atualiza os dados do usuario
router.put("/", async (req, res, next) => {
    try {
        const account = req.body;

        if(!account.id || !account.name || account.balance == null){   //impede que contas sem id, nome ou balanco sejam adicionadas
            throw new Error("ID, Name e Balance sao obrigatorios");     //este erro vai para o catch(err) e o mesmo vai para o tratamento
        }

        const data = JSON.parse(await readFile(global.fileName));
        const index = data.accounts.findIndex(a => a.id === account.id);     //encontra o index da conta que sera alterada

        if(index === -1){   //Se o index informado nao existir, ele recebe -1
            throw new Error("Registro nao encontrado");
        }

        //a conta[index] recebe os valores novos que foram passados na requisicao
        data.accounts[index].name = account.name;     
        data.accounts[index].balance = account.balance;

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(account);

        logger.info(`PUT /account - ${JSON.stringify(account)}`);
    } catch (err) {
        next(err);
    }
});

//router.patch - utilizado para atualizacoes parciais
//Atualiza apenas o 'balance' do usuario
router.patch("/updateBalance", async (req, res, next) => {
    try {
        const account = req.body;
        const data = JSON.parse(await readFile(global.fileName));
        const index = data.accounts.findIndex(a => a.id === account.id);     //encontra o index da conta que sera alterada

        if(!account.id || account.balance == null){   //impede que contas sem nome ou balanco sejam adicionadas
            throw new Error("ID e Balance sao obrigatorios");     //este erro vai para o catch(err) e o mesmo vai para o tratamento
        }

        if(index === -1){   //Se o index informado nao existir, ele recebe -1
            throw new Error("Registro nao encontrado");
        }

        data.accounts[index].balance = account.balance;     //a conta[index] recebe os valores novos que foram passados na requisicao

        await writeFile(global.fileName, JSON.stringify(data, null, 2));

        res.send(data.accounts[index]);

        logger.info(`PATCH /account/updateBalance - ${JSON.stringify(account)}`);
    } catch (err) {
        next(err);
    }
});

//Tratamento de erros
router.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
    res.status(400).send({ error: err.message });
});

export default router;