import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

function Chat({ onEdit }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editText, setEditText] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (reply === null) { setLatestReply(null); return; }
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

    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [prevChats, latestReply]);

    const startEdit = (idx, content) => {
        setEditingIdx(idx);
        setEditText(content);
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditText("");
    };

    const submitEdit = (idx) => {
        if (!editText.trim()) return;
        onEdit(idx, editText.trim());
        setEditingIdx(null);
        setEditText("");
    };

    if (newChat) {
        return (
            <div className="chatScrollOuter">
                <div className="welcomeScreen">
                    <h1>What can I help with?</h1>
                    <p>Ask anything — SigmaGPT is ready.</p>
                </div>
            </div>
        );
    }

    const mdProps = {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
        components: {
            table: ({ children }) => (
                <div className="table-wrapper">
                    <table>{children}</table>
                </div>
            )
        }
    };

    return (
        <div className="chatScrollOuter" ref={scrollRef}>
            <div className="chatArea">
                {prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {chat.role === "user" ? (
                            <div className="userBubble">
                                {chat.imageUrl && <img src={chat.imageUrl} alt="uploaded" className="chatImage" />}
                                {editingIdx === idx ? (
                                    <div className="editBox">
                                        <textarea
                                            className="editTextarea"
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(idx); }
                                                if (e.key === "Escape") cancelEdit();
                                            }}
                                            autoFocus
                                            rows={3}
                                        />
                                        <div className="editActions">
                                            <button className="editSendBtn" onClick={() => submitEdit(idx)}>Send</button>
                                            <button className="editCancelBtn" onClick={cancelEdit}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="userMsgWrap">
                                        <p className="userMessage">{chat.content}</p>
                                        <button className="editBtn" onClick={() => startEdit(idx, chat.content)} title="Edit message">
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="gptContent"><ReactMarkdown {...mdProps}>{chat.content}</ReactMarkdown></div>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && (
                    <div className="gptDiv">
                        <div className="gptContent">
                            <ReactMarkdown {...mdProps}>
                                {latestReply === null ? prevChats[prevChats.length - 1].content : latestReply}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
