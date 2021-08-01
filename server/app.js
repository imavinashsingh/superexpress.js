import 'core-js/es7/reflect';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import { loadControllers } from './lib/super_router';
import Userexample from './controllers/UserExample';
import { loadModels } from './lib/super_mysql';
import UserExampleModel from './models/UserExample';
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

loadModels([
    UserExampleModel
])

app.use('/api', loadControllers([
    Userexample
]));

export default app;
