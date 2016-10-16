const Results = require('../models/results');
const Utils = require('../utils/utils');

class TaskController {
    constructor(taskRepository, randomFailureChance) {
        this.taskRepository = taskRepository;
        this.randomFailureChance = randomFailureChance;
    }
    getTaskTypes(req, res) {
        res.json(this.taskRepository.getTaskTypes());
    }
    getTasks(req, res) {
        this.createResponseFromResult(res, () => {
            const tasks = this.taskRepository.getTasks({
                name: req.query.name,
                from: req.query.from,
                to: req.query.to,
                typeId: req.query.typeId,
                statusCode: req.query.statusCode
            });

            const skip = +req.query.skip;
            const take = +req.query.take;
            if (isNaN(skip) || isNaN(take)) {
                return Results.OperationResult.Success(tasks);
            } else {
                return Results.OperationResult.Success(new Results.PagedResult(tasks, skip, take));
            }
        });
    }
    getTask(req, res) {
        this.createResponseFromResult(res, () => {
            const id = parseInt(req.params.id);
            return this.taskRepository.getTask(id);
        });
    }
    deleteTask(req, res) {
        this.createResponseFromResult(res, () => {
            const id = parseInt(req.params.id);
            return this.taskRepository.deleteTask(id);
        });
    }
    updateTask(req, res) {
        this.createResponseFromResult(res, () => {
            const id = parseInt(req.params.id);
            const taskName = req.body.name;
            console.log(req.body);
            const taskTypeId = parseInt(req.body.typeId);
            return this.taskRepository.updateTask(id, taskName, taskTypeId);
        });
    }
    createTask(req, res) {
        this.createResponseFromResult(res, () => {
            const taskName = req.body.name;
            const taskTypeId = parseInt(req.body.typeId);
            return this.taskRepository.createTask(taskName, taskTypeId);
        });
    }

    createResponseFromResult(res, func) {
        try {
            const result = func();
            if (result && !this.createRandomFailure(res)) {
                if (result.code === Results.OperationResultCodeEnum.SUCCESS) {
                    res.json(result.params);
                } else {
                    res.status(OperationResultMapper.map(result).toStatus()).send();
                }
            }
        } catch (e) {
            console.log(e);
            res.status(400).send(e);
        }
    }

    createRandomFailure(res) {
        if (Utils.getRandomInt(100) < this.randomFailureChance) {
            res.status(503).send('Сервер не смог обработать команду, попробуйте повторить операцию позже');
            return true;
        }
        return false;
    }
}

class OperationResultMapper {
    static map(operationResult) {
        return {
            toStatus() {
                const operationResultMap = new Map();
                operationResultMap.set(Results.OperationResultCodeEnum.NOT_FOUND, 404);
                operationResultMap.set(Results.OperationResultCodeEnum.INVALID_ARGUMENTS, 400);
                operationResultMap.set(Results.OperationResultCodeEnum.SUCCESS, 200);

                return operationResultMap.get(operationResult.code) || 500;
            }
        }
    }
}

module.exports = TaskController;