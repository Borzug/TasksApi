const _ = require('lodash');
const moment = require('moment');
const Models = require('../models/models');
const Results = require('../models/results');

class TaskRepository {
    constructor(entities) {
        this.entities = entities;
    }

    getNewId(list) { return (_.max(list.map(item => item.id)) + 1) || 0; }

    createTaskType(name) {
        const newId = this.getNewId(this.entities.taskTypes);
        this.entities.taskTypes.push(new Models.TaskType(newId, name));
        return newId;
    }

    getTaskTypes() {
        return this.entities.taskTypes;
    }

    getTaskStatusTypes() {
        return Models.TaskStatusCodeEnum.getNames();
    }

    createTask(name, taskTypeId, creationDate, endDate, statusCode, progress) {
        const taskTypeResult = this.getTaskType(taskTypeId);
        if (taskTypeResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.InvalidArguments();
        }
        const newId = this.getNewId(this.entities.tasks);
        const newTask = new Models.Task(newId, name, taskTypeResult.params, creationDate, endDate, statusCode, progress);
        this.entities.tasks.push(newTask);

        return Results.OperationResult.Success({ id: newId });
    }

    getTaskType(taskTypeId) {
        const foundTaskType = _.find(this.entities.taskTypes, { id: taskTypeId });
        return foundTaskType ?
            Results.OperationResult.Success(foundTaskType) :
            Results.OperationResult.NotFound();
    }

    getTasks(filter) {
        if (!filter) {
            return this.entities.tasks;
        } else {
            return this.filterTasks(this.entities.tasks, filter);
        }
    }

    filterTasks(tasks, filter) {
        return _.filter(tasks, task => {
            return (filter.name ? task.name.toLowerCase().indexOf(filter.name.toLowerCase()) !== -1 : true) &&
                (filter.from ? moment(task.creationDate) >= moment(filter.from) : true) &&
                (filter.to ? moment(task.creationDate) <= moment(filter.to) : true) &&
                (filter.typeId ? this.filterByTypeId(task, filter.typeId) : true) &&
                (filter.statusCode ? this.filterByStatusCode(task, filter.statusCode) : true)
        });
    }

    filterByTypeId(task, typeId) {
        if (Array.isArray(typeId)) {
            return typeId.map((id) => parseInt(id)).includes(task.type.id);
        }
        return parseInt(typeId) === task.type.id;
    }

    filterByStatusCode(task, statusCode) {
        const taskStatusCode = task.statusCode.toLowerCase();
        if (Array.isArray(statusCode)) {
            return statusCode.map((code) => code.toLowerCase()).includes(taskStatusCode);
        }
        return taskStatusCode === statusCode.toLowerCase();
    }

    getTask(id) {
        const foundTask = _.find(this.entities.tasks, { id });
        return foundTask ?
            Results.OperationResult.Success(foundTask) :
            Results.OperationResult.NotFound();
    }
    deleteTask(id) {
        return _.remove(this.entities.tasks, { id }).length > 0 ?
            Results.OperationResult.Success() :
            Results.OperationResult.NotFound();
    }
    updateTask(id, name, taskTypeId, creationDate, endDate, statusCode, progress) {
        const taskResult = this.getTask(id);
        if (taskResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.NotFound();
        }
        const taskTypeResult = this.getTaskType(taskTypeId);
        if (taskTypeResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.InvalidArguments();
        }

        const task = taskResult.params;
        task.name = name;
        task.type = taskTypeResult.params;
        task.creationDate = creationDate || task.creationDate;
        task.endDate = endDate || task.endDate;
        task.statusCode = statusCode || task.statusCode;
        task.progress = progress || task.progress;

        return Results.OperationResult.Success();
    }

    updateTaskProgress(id, progress) {
        const taskResult = this.getTask(id);
        if (taskResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.NotFound();
        }
        const task = taskResult.params;
        if(
            !task.progress && 
            progress > 0 && 
            task.statusCode === Models.TaskStatusCodeEnum.QUEUED
            ) 
        {
            task.statusCode = Models.TaskStatusCodeEnum.RUNNING;
        }
        task.progress = progress > 100 ? 100 : progress;
        if(task.progress === 100) {
        	this.finishTask(id);
        }

        return Results.OperationResult.Success();
    }

    finishTask (id) {
    	const taskResult = this.getTask(id);
    	if (taskResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.NotFound();
        }
        const task = taskResult.params;
        task.statusCode = Models.TaskStatusCodeEnum.FINISHED;
        task.endDate = new Date();

        return Results.OperationResult.Success();
    }

    updateTaskStatus(id, statusCode) {
        const taskResult = this.getTask(id);
        if (taskResult.code === Results.OperationResultCodeEnum.NOT_FOUND) {
            return Results.OperationResult.NotFound();
        }
        const task = taskResult.params;
        if (!Models.TaskStatusCodeEnum.isDefined(statusCode)) {
            return Results.OperationResult.InvalidArguments();
        }
        taskResult.params.statusCode = statusCode;

        return Results.OperationResult.Success();
    }
}

module.exports = TaskRepository;