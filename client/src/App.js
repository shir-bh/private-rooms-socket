import "./App.css";
import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3030");

function App() {
  // let inputRef = "";
  const inputRef = useRef("");
  const [messages, set_messages] = useState([]);
  const [room, setroom] = useState("public");
  const [typingID, settypingID] = useState("");

  useEffect(() => {
    socket.on("chat message", (msg) => {
      set_messages((messages) => [...messages, msg]);
    });

    socket.on("user joined", function (socket_id) {
      set_messages((msgs) => [...msgs, `user ${socket_id} joined`]);
    });
    socket.on("joined", function () {
      set_messages((msgs) => [...msgs, `You Are In the private room`]);
    });
    socket.on("exit private room", function () {
      set_messages((msgs) => [...msgs, `You have left the private room`]);
    });
    socket.on("type", function (socket_id) {
      if (socket_id) {
        settypingID(socket_id);
      }
    });
    socket.on("end type", function () {
      settypingID("");
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputRef.current.value) {
      socket.emit("chat message", { msg: inputRef.current.value, room });
      // socket.to(room).emit("chat message", inputRef.current.value);
      inputRef.current.value = "";
    }
  };
  const joinPrivate = () => {
    if (room === "public") {
      setroom("private");
      socket.emit("join private");
    }
  };
  const joinPublic = () => {
    if (room === "private") {
      setroom("public");
      socket.emit("join public");
    }
  };

  const startTyping = () => {
    socket.emit("start typing", room);
  };
  const endTyping = () => {
    socket.emit("end typing", room);
  };

  return (
    <Wrapper>
      <BTNdiv>
        <Button onClick={joinPublic}>public</Button>
        <Button onClick={joinPrivate}>private</Button>
      </BTNdiv>
      <ChatWrapper>
        <h1>{typingID && `user ${typingID} is typing`}</h1>
        <Ul id="messages">
          {messages.map((item) => (
            <li>{item}</li>
          ))}
        </Ul>
        <Form id="form" action="" onSubmit={handleSubmit}>
          <Input
            onFocus={startTyping}
            onBlur={endTyping}
            id="input"
            autoComplete="off"
            ref={inputRef}
          />
          <button>Send</button>
        </Form>
      </ChatWrapper>
    </Wrapper>
  );
}

export default App;

const ChatWrapper = styled.div`
  margin: 0;
  padding-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
`;
const Form = styled.form`
  background: rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 3rem;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  button {
    background: #333;
    border: none;
    padding: 0 1rem;
    margin: 0.25rem;
    border-radius: 3px;
    outline: none;
    color: #fff;
  }
`;
const Input = styled.input`
  border: none;
  padding: 0 1rem;
  flex-grow: 1;
  border-radius: 2rem;
  margin: 0.25rem;
  :focus {
    outline: none;
  }
`;
const Ul = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  li {
    padding: 0.5rem 1rem;
  }
  li:nth-child(odd) {
    background: #efefef;
  }
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
`;
const BTNdiv = styled.div`
  display: flex;
  justify-content: center;
  height: 2rem;
`;
const Button = styled.button`
  background-color: white;
  color: black;
  border: 2px solid #e7e7e7;
  :hover {
    background-color: #e7e7e7;
  }
`;
