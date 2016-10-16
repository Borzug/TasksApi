module.exports = function (express, taskController) {
    const tasksRoute = '/tasks';
    const router = express.Router();

    router.route(tasksRoute)
        .get((req, res) => {
            taskController.getTasks(req, res);
        })
        .post((req, res) => {
            taskController.createTask(req, res);
        });

    router.route(`${tasksRoute}/types`)
        .get((req, res) => {
            taskController.getTaskTypes(req, res);
        });

    router.route(`${tasksRoute}/:id`)
        .get((req, res) => {
            taskController.getTask(req, res);
        })
        .delete((req, res) => {
            taskController.deleteTask(req, res);
        })
        .put((req, res) => {
            taskController.updateTask(req, res);
        });
    return router;
}