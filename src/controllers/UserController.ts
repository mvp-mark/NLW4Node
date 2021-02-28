import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from '../repositories/UserRepository';
import * as yup from 'yup';
import { AppError } from "../errors/AppError";

class UserController {

    async create(req: Request, res: Response) {

        const { name, email } = req.body;

        const schema = yup.object().shape({
            name: yup.string().required("Nome é obrigatório"),
            email: yup.string().email().required("Email é obrigatório")
        })

        // if (!(await schema.isValid(req.body))) {
        //     return res.status(400).json({ error: "Validation Failed!" })
        // }

        try {
            await schema.validate(req.body, { abortEarly: false });
        }
        catch (err) {
            throw new AppError(err);
        }

        const userRepository = getCustomRepository(UsersRepository);

        const userAlreadyExist = await userRepository.findOne({
            email
        })
        if (userAlreadyExist) {
            throw new AppError("User already exist!");
        }

        const user = userRepository.create({
            name, email
        })

        await userRepository.save(user);

        return res.status(201).json(user);
    }

}

export { UserController };
