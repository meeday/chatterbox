import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ChakraProvider } from "@chakra-ui/react";
import { Register, Chat } from "./pages";

const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const { auth } = useSelector((state) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate("/register");
    }
  }, [auth.isLoggedIn, navigate]);

  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        {auth.isLoggedIn ? (
          <Routes>
            <Route path="/" element={<Chat />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        )}

        <ToastContainer position="top-center" />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default App;
