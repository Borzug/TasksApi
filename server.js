const express     = require('express');        
const app         = express();       
const router      = require('./router');
const bodyParser  = require('body-parser');
const compression = require('compression');
const cors        = require('cors');
const Configuration = require('./config.json');

const Entities = require('./app/data/entities');
const TaskRepository = require('./app/repositories/taskRepository');
const TaskSeeder = require('./app/repositories/taskSeeder');
const TaskController = require('./app/controllers/taskController');
const TaskRunner = require('./app/taskrunner/taskrunner');

app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || Configuration.Port;
const seededTasksCount = process.argv[2] || Configuration.SeededTasksCount;
const maxTaskQueueLength = Configuration.MaxTaskQueueLength;
const processingCyclesInterval = Configuration.ProcessingCyclesInterval;

const entities = new Entities();
const taskRepository = new TaskRepository(entities, Configuration.RandomFailureChance);
const taskSeeder = new TaskSeeder(taskRepository);
taskSeeder.seedTasks(seededTasksCount);
const taskController = new TaskController(taskRepository);
const taskRunner = new TaskRunner(taskRepository, maxTaskQueueLength, processingCyclesInterval);

const routes = router(express, taskController);

app.use(Configuration.ApiRoot, routes);
app.listen(port);

console.log('TasksApi is running on port ' + port);