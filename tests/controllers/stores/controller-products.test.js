'use strict';

import app from '../src/app';
import request from 'supertest';
import { getMongoStoresCollection } from '../src/mongodb/collections';
import { StatusCodes } from 'http-status-codes';

import {
    connectMongoDBClient,
    disconnectMongoDBClient,
    getClient,
} from '../src/storage/mongodb/setup';

describe('Tests for the Product endpoints', () => {
    beforeAll(async function () {});
    afterAll(async function () {});
    it('Add Product', async function () {});
    it('Edit Product', async function () {});
    it('Delete Product', async function () {});
});
