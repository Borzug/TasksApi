class TaskType {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Task {
    constructor(
        id,
        name,
        taskType,
        creationDate,
        endDate,
        statusTypeCode,
        progress) {
        this.id = id;
        this.name = name;
        this.type = taskType;
        this.creationDate = creationDate || new Date();
        this.endDate = endDate || null;
        this.statusCode = statusTypeCode || TaskStatusCodeEnum.QUEUED;
        this.progress = progress || 0;
    }
}

class TaskStatusCodeEnum {
    static get QUEUED() { return 'QUEUED'; }
    static get RUNNING() { return 'RUNNING'; }
    static get CANCELED() { return 'CANCELED'; }
    static get FINISHED() { return 'FINISHED'; }
    static get FAILED() { return 'FAILED'; }

    static getNames() {
        return [
            TaskStatusCodeEnum.QUEUED,
            TaskStatusCodeEnum.RUNNING,
            TaskStatusCodeEnum.CANCELED,
            TaskStatusCodeEnum.FINISHED,
            TaskStatusCodeEnum.FAILED
        ];
    }

    static isDefined(status) {
        return Object.hasOwnProperty(TaskStatusCodeEnum, status);
    }
}

module.exports = {
    Task,
    TaskStatusCodeEnum,
    TaskType
}; 