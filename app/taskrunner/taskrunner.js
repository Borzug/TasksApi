const _ = require('lodash');
const Results = require('../models/results');
const Models = require('../models/models');
const Utils = require('../utils/utils');

class TaskRunner {
    constructor(taskRepository, maxTaskQueueLength, processingCyclesInterval) {
        this.taskRepository = taskRepository;
        this.taskQueue = [];
        this.finishedStates = new Set([Models.TaskStatusCodeEnum.FINISHED, Models.TaskStatusCodeEnum.FAILED, Models.TaskStatusCodeEnum.CANCELED]);
        this.maxTaskQueueLength = maxTaskQueueLength;
        this.processingCyclesInterval = processingCyclesInterval;
        this.processTasks();
    }

    processTasks() {
        let freeSlotsCount = 0;
        if (freeSlotsCount = (this.maxTaskQueueLength - this.taskQueue.length)) {
            this.fillQueue(freeSlotsCount);
        }
        this.simulateWork();
        this.cleanQueue();
        this.timerId = setTimeout(this.processTasks.bind(this), this.processingCyclesInterval);
    }

    fillQueue(freeSlotsCount) {
        let tasksToRun = this.taskRepository.getTasks({ 'statusCode': Models.TaskStatusCodeEnum.RUNNING });
        if (!tasksToRun.length) {
            tasksToRun = this.taskRepository.getTasks({ 'statusCode': Models.TaskStatusCodeEnum.QUEUED });
        }

        if (tasksToRun.length) {
            _.take(tasksToRun, freeSlotsCount).forEach(task => {
                this.taskQueue.push(task);
                this.taskRepository.updateTaskStatus(task.id, Models.TaskStatusCodeEnum.RUNNING);
            });
        }
    }

    simulateWork() {
        this.taskQueue.forEach(task => {
            let opResult;
            if (Utils.getRandomInt(100) < 5) {
                opResult = this.taskRepository.updateTaskStatus(task.id, Models.TaskStatusCodeEnum.FAILED);
            } else {
                const progressIncrement = Utils.getRandomInt(6) + 1;
                opResult = this.taskRepository.updateTaskProgress(task.id, task.progress + progressIncrement);
            }

            if(opResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
                this.dequeueTask(task.id);
            }
        });
    }

    cleanQueue() {
        this.taskQueue.forEach(task => {
            if (this.finishedStates.has(task.statusCode)) {
                this.dequeueTask(task.id);
            }
        });
    }

    dequeueTask (taskId) {
        _.remove(this.taskQueue, { id: taskId });
    }
}

module.exports = TaskRunner;