import express from "express"
import { categories } from "../controllers/category.controller.js"

const categoryRouter = express.Router()

categoryRouter
    .get('/', categories)

export default categoryRouter