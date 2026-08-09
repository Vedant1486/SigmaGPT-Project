import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import BASE_URL from "./api.js";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, prevChats, setNewChat, token, username, handleLogout, setSidebarOpen } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImageBase64(reader.result);
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageBase64(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getReply = async () => {
        if (!prompt.trim() && !imageBase64) return;
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: prompt,
                    threadId: currThreadId,
                    imageBase64: imageBase64 || null
                })
            });
            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }

        removeImage();
        setLoading(false);
    };

    const handleEdit = async (msgIdx, newText) => {
        const trimmed = prevChats.slice(0, msgIdx);
        setPrevChats(trimmed);
        setReply(null);
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: newText, threadId: currThreadId })
            });
            const res = await response.json();
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: newText },
                { role: "assistant", content: res.reply }
            ]);
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: prompt, imageUrl: imageBase64 },
                { role: "assistant", content: reply }
            ]);
        }
        setPrompt("");
    }, [reply]);

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navLeft">
                    <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span>SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
                </div>
                <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem username-item">
                        <i className="fa-solid fa-circle-user"></i> {username}
                    </div>
                    <div className="dropDownDivider"></div>
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem logout" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            )}

            <Chat onEdit={handleEdit} />

            <div className="loaderWrap">
                <ScaleLoader color="#555" height={16} loading={loading} />
            </div>

            <div className="chatInput">
                {imagePreview && (
                    <div className="imagePreviewWrap">
                        <img src={imagePreview} alt="preview" className="imagePreview" />
                        <button className="removeImageBtn" onClick={removeImage}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
                <div className="inputBox">
                    <label htmlFor="fileUpload" className="attachBtn" title="Attach image">
                        <i className="fa-solid fa-paperclip"></i>
                    </label>
                    <input
                        id="fileUpload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <input
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getReply()}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">SigmaGPT can make mistakes. Check important info.</p>
            </div>
        </div>
    );
}

export default ChatWindow;
