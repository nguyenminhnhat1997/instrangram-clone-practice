import express from "express";
import bodyParser from "body-parser";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";
import cors from "cors";
import { apolloUploadExpress } from "apollo-upload-server";
import mongoose from "mongoose";
mongoose.Promise = global.Promise;
import models from "./models/index";
import auth from "./auth";
import path from "path";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import "dotenv/config";
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, "./types")));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "./resolvers"))
);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
// const PORT = 3002;
// const SECRET = "dfsdhsdjgsjdngj";
const app = express();
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
app.use(
  cors({
    origin: ["http://localhost:3002"]
  })
);
app.use(auth.checkHeaders);
// bodyParser is needed just for POST.
app.use(
  "/graphql",
  bodyParser.json(),
  apolloUploadExpress(/* Options */),
  graphqlExpress(req => {
    return {
      schema,
      context: {
        models,
        SECRET: process.env.SECRET,
        user: req.user
      }
    };
  })
);
app.get("/graphiql", graphiqlExpress({ endpointURL: "/graphql" })); // if you want GraphiQL enabled
//connect database
mongoose.connect("mongodb://localhost:27017/instagram-clone").then(() => {
  console.log("Connected mongoose");
  app.listen(process.env.PORT, () => {
    console.log("Server run on port 3002");
  });
});
