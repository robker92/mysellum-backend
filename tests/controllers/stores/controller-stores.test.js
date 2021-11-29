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

describe('Tests for the stores endpoints', () => {
    beforeAll(async function () {});
    afterAll(async function () {});

    //Stores
    it('Create Store', async function () {});
    it('Activate Store', async function () {});
    it('Edit Store', async function () {});
    it('Get Store', async function () {});
    it('Search for Stores', async function () {});

    //Reviews
    it('Add Review', async function () {});
    it('Edit Review', async function () {});
    it('Delete Review', async function () {});
});
