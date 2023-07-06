const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { authMiddleware } = require("./utils/auth");

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    io.on("connection", (socket) => {
      socket.on("setup", (userData) => {
        socket.join(userData._id);

        socket.emit("connected");
      });

      socket.on("join-chat", (room) => {
        socket.join(room);
      });

      socket.on("typing", (room) => socket.in(room).emit("typing"));
      socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));

      socket.on("new-message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;

        if (!chat.users) return console.log(`chat.users not defined`);

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;

          socket.in(user._id).emit("message-received", newMessageReceived);
        });
      });

      socket.off("setup", () => {
        socket.leave(userData._id);
      });
    });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../client/build")));
    }

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/"));
    });

    httpServer.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

startApolloServer();
