import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import BASE_URL from "./api.js";
import blacklogo from "./assets/blacklogo.png";

const logoSvg = "/logo.svg";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, token, sidebarOpen, setSidebarOpen } = useContext(MyContext);

    const headers = { "Authorization": `Bearer ${token}` };

    const getAllThreads = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/thread`, { headers });
            const res = await response.json();
            setAllThreads(res.map(t => ({ threadId: t.threadId, title: t.title })));
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setSidebarOpen(false);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        setSidebarOpen(false);
        try {
            const response = await fetch(`${BASE_URL}/api/thread/${newThreadId}`, { headers });
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`${BASE_URL}/api/thread/${threadId}`, { method: "DELETE", headers });
            setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
            <button className="newChatBtn" onClick={createNewChat}>
                <img src={logoSvg} alt="logo" className="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {allThreads.length > 0 && <p className="historyLabel">Recent</p>}

            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li
                        key={idx}
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
                        {thread.title}
                        <i
                            className="fa-solid fa-trash"
                            onClick={(e) => { e.stopPropagation(); deleteThread(thread.threadId); }}
                        ></i>
                    </li>
                ))}
            </ul>

            <div className="sign">
                <p>SigmaGPT &hearts;</p>
            </div>
        </section>
    );
}

export default Sidebar;
