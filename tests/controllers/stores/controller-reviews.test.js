'use strict';

import app from '../src/app';
import request from 'supertest';
import { getMongoStoresCollection } from '../src/mongodb/collections';
import { StatusCodes } from 'http-status-codes';

import {
    connectMongoDBClient,
    disconnectMongoDBClient,
    getClient,
} from '../src/mongodb/setup';

describe('Tests for the Review endpoints', () => {
    beforeAll(async function () {});
    afterAll(async function () {});
    it('Add Review', async function () {});
    it('Edit Review', async function () {});
    it('Delete Review', async function () {});
});
