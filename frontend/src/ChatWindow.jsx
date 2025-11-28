import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import AlertBox from "./AlertBox.jsx";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [alert, setAlert] = useState(null);

    const getReply = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setNewChat(false);

        const lowerPrompt = prompt.toLowerCase().trim();

        if (lowerPrompt.includes("open") && lowerPrompt.includes("youtube")) {
            window.open("https://www.youtube.com/", "_blank");
            setReply("Opening YouTube...");
            setPrevChats(prev => [...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: "Opening YouTube..." }
            ]);
            setPrompt("");
            setLoading(false);
            return;
        }

        if (lowerPrompt.includes("open") && lowerPrompt.includes("insta")) {
            window.open("https://www.instagram.com/gh_raisonipune?igsh=dDk5N2E3Y2x2cGJz", "_blank");
            setReply("Opening Instagram...");
            setPrevChats(prev => [...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: "Opening Instagram..." }
            ]);
            setPrompt("");
            setLoading(false);
            return;
        }

        if (lowerPrompt.includes("open") && lowerPrompt.includes("raisoni") && lowerPrompt.includes("site")) {
            window.open("https://ghrcemp.raisoni.net/", "_blank");
            setReply("Opening ...");
            setPrevChats(prev => [...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: "Opening Raisoni site..." }
            ]);
            setPrompt("");
            setLoading(false);
            return;
        }

        // if (lowerPrompt.includes("time")) {
        //     const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        //     setReply(`The current time is ${time}`);
        //     setPrevChats(prev => [...prev,
        //         { role: "user", content: prompt },
        //         { role: "assistant", content: `The current time is ${time}` }
        //     ]);
        //     setPrompt("");
        //     setLoading(false);
        //     return;
        // }

        // ---- API CALL ----
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log("API response:", res);

            if (res.alert) {
                setAlert({
                    message: res.message,
                    category: res.category
                });
                setReply(""); // don’t show normal reply if malicious
            } else {
                const modifiedReply = res.reply.replace(/google/gi, "RaisoniGroup");
                setReply(modifiedReply);
            }
        } catch (err) {
            console.log(err);
            setReply("Something went wrong. Please try again.");
        }

        setLoading(false);
    };

    // Append new chat
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => [
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]);
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>RaisoniGPT <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            {isOpen && (
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem"><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            )}

            {/* Show Alert if Malicious */}
            {alert && (
                <AlertBox
                    message={alert.message}
                    category={alert.category}
                    onClose={() => setAlert(null)}
                />
            )}

            <Chat />

            {/* <ScaleLoader color="#fff" loading={loading} /> */}

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading ? getReply() : ""}
                        disabled={loading}
                        className={loading ? "loadingInput" : ""}
                    />

                    {loading && (
                        <div className="inputLoader">
                            <ScaleLoader color="#339cff" height={15} width={3} margin={2} />
                        </div>
                    )}

                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>

                <p className="info">
                    RaisoniGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
