import { Context } from './day4.context.mjs';
import {stdin } from 'node:process';
import { createInterface } from 'node:readline';
import { readContent } from '../readstream.js';

const strm = createInterface({ input: stdin });
const context = new Context();

readContent(strm, context);
