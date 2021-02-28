import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveyRepository } from "../repositories/SurveyRepository";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";
import { UsersRepository } from "../repositories/UserRepository";
import SendMailService from "../services/SendMailService";
import { resolve } from "path";
import { AppError } from "../errors/AppError";



class SendMailController {
    async execute(req: Request, res: Response) {
        const { email, survey_id } = req.body;

        const usersRepository = getCustomRepository(UsersRepository);

        const surveyRepository = getCustomRepository(SurveyRepository);

        const surveysUsersRepository = getCustomRepository(SurveyUsersRepository);

        const user = await usersRepository.findOne({ email });

        if (!user) {
            throw new AppError("User does not exist");
        }


        const survey = await surveyRepository.findOne({ id: survey_id });

        if (!survey) {
            throw new AppError("Survey does not exist!");

        }
        const npsPath = resolve(__dirname, '..', "views", 'emails', 'npsMail.hbs');


        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id
        })

        const surveyUserAlreadyExist = await surveysUsersRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", 'survey']
        })
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: '',
            link: process.env.URL_MAIL,
        }


        if (surveyUserAlreadyExist) {
            variables.id = surveyUserAlreadyExist.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return res.json(surveyUserAlreadyExist);
        }

        await surveysUsersRepository.save(surveyUser);

        variables.id = surveyUser.id;


        await SendMailService.execute(email, survey.title, variables, npsPath);



        return res.json(surveyUser);

    }
}

export { SendMailController }