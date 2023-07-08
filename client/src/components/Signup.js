import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { SIGNUP } from "../utils/mutations";
import { signup_user } from "..//reducers/authReducer";
import { socket } from "../socket";

import FileBase from "react-file-base64";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  const [signup] = useMutation(SIGNUP);

  const dispatch = useDispatch();

  const submitHandler = async () => {
    const { email, password, username } = values;

    if (!username || !email || !password) {
      toast.error("Please Provide All The Fields");

      return;
    }

    try {
      const { data } = await signup({
        variables: { userData: { ...values } },
      });

      const userData = {
        token: data.signup.token,
        username: data.signup.user.username,
        userId: data.signup.user._id,
        email: data.signup.user.email,
        bio: data.signup.user.bio,
        avatar: data.signup.user.avatar,
      };
      dispatch(signup_user(userData));
      socket.connect();
      localStorage.setItem("id_token", data.signup.token);
      toast.success(`Hi There! ${data.signup.user.username} `);

      navigate("/");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <VStack spacing="5px" fontFamily="Poppins">
      <FormControl id="first-name" isRequired>
        <FormLabel fontFamily="Poppins">username</FormLabel>
        <Input
          fontFamily="Poppins"
          placeholder="username"
          onChange={(e) => setValues({ ...values, username: e.target.value })}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>email</FormLabel>
        <Input
          type="email"
          placeholder="email"
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>password</FormLabel>
        <InputGroup size="md">
          <Input
            id="signup-password"
            type={show ? "text" : "password"}
            placeholder="password"
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload Pic</FormLabel>
        <FileBase
          type="file"
          label="Image"
          multiple={false}
          name="myFile"
          p={1.5}
          onDone={({ base64 }) => setValues({ ...values, avatar: base64 })}
        />
      </FormControl>
      <Button
        background="rgba(67, 43, 255, 0.8)"
        color="white"
        width="100%"
        _hover={{
          background: " rgba(67, 43, 255, 0.8)",
          color: "white",
          transform: "translate(0,-5px)",
        }}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
