import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { socket } from "../socket";
import { Button } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@apollo/client";
import { LOGIN } from "../utils/mutations";
import { login_user } from "..//reducers/authReducer";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [values, setValues] = useState({
    username: "",
    password: "",
    loading: false,
  });

  const navigate = useNavigate();

  const [login] = useMutation(LOGIN);

  const dispatch = useDispatch();

  const submitHandler = async () => {
    setValues({ ...values, loading: true });
    const { username, password } = values;
    if (!username || !password) {
      toast.error("Please Fill All the Fields");
      setValues({ ...values, loading: false });
      return;
    }
    try {
      const { data } = await login({
        variables: { username, password },
      });

      dispatch(
        login_user({
          token: data.login.token,
          username: data.login.user.username,
          userId: data.login.user._id,
          email: data.login.user.email,
          bio: data.login.user.bio,
          avatar: data.login.user.avatar,
        })
      );
      socket.connect();
      localStorage.setItem("id_token", data.login.token);
      toast.success(`Welcome Back! ${data.login.user.username}`);

      setValues({ ...values, loading: false });
      navigate("/");
    } catch (error) {
      toast.error(error);
      setValues({ ...values, loading: false });
    }
  };

  return (
    <VStack spacing="10px" fontFamily="Poppins">
      <FormControl id="username" isRequired>
        <FormLabel>username</FormLabel>
        <Input
          value={values.username}
          type="username"
          placeholder="username"
          onChange={(e) => setValues({ ...values, username: e.target.value })}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>password</FormLabel>
        <InputGroup size="md">
          <Input
            id="login-password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            type={show ? "text" : "password"}
            placeholder="password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        background="rgba(67, 43, 255, 0.8)"
        width="100%"
        color="white"
        _hover={{
          background: " rgba(67, 43, 255, 0.8)",
          color: "white",
          transform: "translate(0,-5px)",
        }}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={values.loading}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
