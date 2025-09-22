// var day = require('./day5.context');
import { Context } from './day5.context.mjs';
import {stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from '../readstream.js';

const strm = createInterface({ input: stdin });
const context = new Context();

readContent(strm, context);
