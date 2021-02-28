import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";


class AnswerController {


    async execute(req: Request, res: Response) {

        const { value } = req.params;
        const { U } = req.query;

        const surveyUsersRepository = getCustomRepository(SurveyUsersRepository);

        const surveyUser = await surveyUsersRepository.findOne({
            id: String(U)
        });

        if (!surveyUser) {
            throw new AppError("Survey User does not exist!");
        }


        surveyUser.value = Number(value);


        await surveyUsersRepository.save(surveyUser);

        return res.json(surveyUser);


    }
}

export { AnswerController }