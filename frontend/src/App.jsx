import './App.css'
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import {v1 as uuidv1} from 'uuid';
function App() {
  const [prompt,setPrompt]=useState("");
  const [reply,setReply]=useState(null);
  const [currThreadId,setCurrentThreadId]=useState(uuidv1()); 
  const [prevChats,setPrevChats]=useState([]);//starts all chats of curr threads
  const [newChat,setNewChat]=useState(true);
  const [allThreads,setAllThreads]=useState([]);
    const providerValues = {
      prompt,setPrompt,
      reply,setReply,
      currThreadId,setCurrentThreadId,
      prevChats,setPrevChats,
      newChat,setNewChat,
      allThreads,setAllThreads
    };


  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
      <Sidebar />
      <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
