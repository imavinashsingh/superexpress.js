import 'core-js/es7/reflect';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import { loadControllers } from './lib/super_router';
import { loadModels } from './lib/super_mysql'
import UserController from './controllers/UserExample';
import UserModel from './models/UserExample';
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

loadModels([
    UserModel
])

app.use('/api', loadControllers([
    UserController
]));

export default app;
