const moment = require('moment');

const Models = require('../models/models');
const Utils = require('../utils/utils');
const verbs = require('./verbs');
const verbsLength = verbs.length;

class TaskSeeder {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
        this.taskTypes = taskRepository.getTaskTypes();
    }

    seedTasks(count) {
        this.seedTaskTypes();
        for (let taskIndex = count - 1; taskIndex >= 0; taskIndex--) {
            this.createTask(taskIndex);
        }
    }

    createTask(id) {
        const creationDate = moment().subtract(id, 'day');
        
        let progress = Utils.getRandomInt(101);
        // больше завершенных задач
        if(progress > 80) {
            progress = 100;
        }
        if(progress < 5) {
            progress = 0;
        }
        const status = this.getStatusFor(progress);
        const endDate = status === Models.TaskStatusCodeEnum.FINISHED ? this.getEndDate(creationDate) : null;
        
        const task = this.taskRepository.createTask(
            `${verbs[Utils.getRandomInt(verbsLength)]}`,
            this.getRandomTaskTypeId(),
            creationDate.toDate(),
            endDate,
            status,
            progress
        );
        return task;
    }

    getEndDate(creationDate) {
        let endDate = moment(creationDate).add(Utils.getRandomInt(3) + 1, 'day').toDate();
        const today = new Date();
        if(endDate > today) {
            return today;
        }
        return endDate;
    }

    getStatusFor(progress) {
        const chance = Utils.getRandomInt(100);
        if(progress === 0 && chance > 25) {
            return Models.TaskStatusCodeEnum.QUEUED;
        }
        if(progress > 0 && progress < 100 && chance < 25) {
            return chance < 10 ? Models.TaskStatusCodeEnum.FAILED :  Models.TaskStatusCodeEnum.CANCELED;
        }
        if(progress === 100) {
            return Models.TaskStatusCodeEnum.FINISHED;
        }
        return Models.TaskStatusCodeEnum.RUNNING;
    }

    getRandomTaskTypeId () {
        return Utils.getRandomInt(this.taskTypes.length);
    }

    seedTaskTypes() {
        this.taskRepository.createTaskType('Ручное');
        this.taskRepository.createTaskType('Автоматическое');
        this.taskRepository.createTaskType('Расписание');
        this.taskRepository.createTaskType('Срочное');
    }
}

module.exports = TaskSeeder;