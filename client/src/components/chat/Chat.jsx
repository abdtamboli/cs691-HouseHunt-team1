import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats, initialChatReceiver }) {
  const [chat, setChat] = useState(null);
  const [initialChatLoaded, setInitialChatLoaded] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id);
      if (!res.data.seenBy.includes(currentUser.id)) {
        decrease();
      }
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      console.log("New message response:", res.data);
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Auto-open a chat with initialChatReceiver if provided
  useEffect(() => {
    if (initialChatReceiver && !chat && !initialChatLoaded) {
      const openChatWithReceiver = async () => {
        const existingChat = chats.find(
          (c) => c.receiver.id === initialChatReceiver.id
        );
        if (existingChat) {
          await handleOpenChat(existingChat.id, existingChat.receiver);
        } else {
          try {
            const res = await apiRequest.post("/chats", {
              receiverId: initialChatReceiver.id,
            });
            await handleOpenChat(res.data.id, initialChatReceiver);
          } catch (err) {
            console.error("Error creating chat:", err);
          }
        }
        setInitialChatLoaded(true);
      };
      openChatWithReceiver();
    }
  }, [initialChatReceiver, chats, chat, initialChatLoaded]);

  // Listen for incoming messages
  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.put("/chats/read/" + chat.id);
      } catch (err) {
        console.log(err);
      }
    };

    if (chat && socket) {
      socket.on("getMessage", (data) => {
        if (chat.id === data.chatId) {
          setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
          read();
        }
      });
    }
    return () => {
      socket.off("getMessage");
    };
  }, [socket, chat]);

  // Updated handler for closing a chat.
  const handleCloseChat = async () => {
    // Delete the chat if it only contains the blank message.
    if (chat && chat.messages.length === 1 && chat.messages[0].text === "") {
      try {
        await apiRequest.delete("/chats/" + chat.id);
      } catch (err) {
        console.error("Error deleting blank chat:", err);
      }
    }
    setChat(null);
  };

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                c.seenBy.includes(currentUser.id) || chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.receiver.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "noavatar.jpg"} alt="" />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={handleCloseChat}>
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message, index) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                {/* If this is the first message and it's blank, do not show the timestamp */}
                {!(index === 0 && message.text.trim() === "") && (
                  <span>{format(message.createdAt)}</span>
                )}
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
