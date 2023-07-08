import { Avatar, Tooltip, Text } from "@chakra-ui/react";
import React, { useRef, useEffect } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../utils/chatUtils";
import { useSelector } from "react-redux";

const ScrollableChat = ({ messages }) => {
  const { auth } = useSelector((state) => state);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, auth.user.userId) ||
              isLastMessage(messages, i, auth.user.userId)) && (
              <Tooltip
                label={m.sender.username}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.username}
                  src={m.sender.avatar}
                />
              </Tooltip>
            )}
            <span
              style={{
                marginLeft: isSameSenderMargin(
                  messages,
                  m,
                  i,
                  auth.user.userId
                ),
                marginTop: isSameUser(messages, m, i, auth.user.userId)
                  ? 3
                  : 10,

                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    backgroundColor: `${
                      m.sender._id === auth.user.userId ? "#BEE3F8" : "#B9F5D0"
                    }`,
                    borderRadius: "20px",
                    padding: "5px 5px",
                  }}
                >
                  {m.message}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8em",
                    marginTop: "5px",
                    color: "#888888",
                    textAlign: `${
                      m.sender._id === auth.user.userId ? "right" : "left"
                    }`,
                  }}
                >
                  {m.sender.username}
                </span>
              </div>
            </span>
          </div>
        ))}
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default ScrollableChat;
