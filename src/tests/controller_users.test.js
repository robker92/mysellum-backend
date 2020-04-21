const controller_users = require("../controllers/controller_users");

// Set up simple express server and bind controller
const express = require("express");
const app = express();
const router = express.Router();
router.get("/c4c_task", controller.create_c4c_task);
app.use(router);

// Prepare tools for testing
const moxios = require("moxios");
const request = require("supertest");