import { Request, Response } from 'express'; // Certifique-se de importar os tipos do Express
import User from '../models/users'; // Certifique-se de que o caminho do modelo esteja correto



export const getUser = async (req: Request, res: Response): Promise<void> => {

    const users = await User.findAll()

    res.json(users)

}

 export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {


        const { name } = req.body;
        console.log(name)
        // Validação básica para garantir que o nome foi enviado
        if (!name) {
            res.status(400).json({ error: 'Campo nome precisa ser preenchido' });
            return;
        }

        // Criação do usuário no banco de dados
        const user = await User.create({ u_name:name });

        // Retornando sucesso com o usuário criado
        res.status(201).json(user);
    } catch (error) {
        // Tratamento de erro
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


