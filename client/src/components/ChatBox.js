import React from "react";
import { Box } from "@chakra-ui/react";
import "./style.css";
import SingleChat from "./SingleChat";

export default function ChatBox() {
  return (
    <Box
      display={{ base: "flex", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat />
    </Box>
  );
}
