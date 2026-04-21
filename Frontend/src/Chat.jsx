import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }
        if (!prevChats?.length) return;

        const words = reply.split(" ");
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    if (newChat) {
        return (
            <div className="welcomeScreen">
                <h1>What can I help with?</h1>
                <p>Ask anything — SigmaGPT is ready.</p>
            </div>
        );
    }

    return (
        <div className="chatArea">
            {prevChats?.slice(0, -1).map((chat, idx) => (
                <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                    {chat.role === "user"
                        ? <p className="userMessage">{chat.content}</p>
                        : <div><ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown></div>
                    }
                </div>
            ))}

            {prevChats.length > 0 && (
                <div className="gptDiv">
                    <div>
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {latestReply === null
                                ? prevChats[prevChats.length - 1].content
                                : latestReply}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chat;
