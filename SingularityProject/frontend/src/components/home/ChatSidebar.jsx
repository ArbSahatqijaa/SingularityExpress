import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRegCommentDots, FaPhone, FaVideo, FaPaperclip, FaTimes } from 'react-icons/fa';
import API from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

async function getDefaultStream() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cam = devices.find(d => d.kind === 'videoinput');
  const mic = devices.find(d => d.kind === 'audioinput');
  return navigator.mediaDevices.getUserMedia({
    video: cam ? { deviceId: cam.deviceId } : false,
    audio: mic ? { deviceId: mic.deviceId } : false,
  });
}


const ChatSidebar = () => {
  // State for chat UI
  const [isOpen, setIsOpen] = useState(false);
  const [activeFriend, setActiveFriend] = useState(null);
  const [search, setSearch] = useState('');

  // State for real-time chat
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [messageStatus, setMessageStatus] = useState({});
  const [isTyping, setIsTyping] = useState({});
  const [chatNotifications, setChatNotifications] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // State for calls
  const [inCall, setInCall] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [callStatus, setCallStatus] = useState(null);
  
  // Refs
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const processedMessageIds = useRef(new Set());
  const processedCallIds = useRef(new Set());
  const activeCallIds = useRef(new Set());
  const pendingCalls = useRef(new Map());
  
  const { addNotification } = useNotifications();

  // Helper function to check if an event has been processed
  const hasProcessedEvent = (eventId, type) => {
    const ref = type === 'message' ? processedMessageIds : processedCallIds;
    if (ref.current.has(eventId)) {
      return true;
    }
    ref.current.add(eventId);
    if (ref.current.size > 1000) {
      const idsToKeep = Array.from(ref.current).slice(-1000);
      ref.current = new Set(idsToKeep);
    }
    return false;
  };

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isLoadingMessages) {
      scrollToBottom();
    }
  }, [chatMessages, isOpen, isLoadingMessages, scrollToBottom]);

  // Fetch users on component mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await API.get('/users');
        setUsers(res.data);
        const jwtPayload = JSON.parse(atob(localStorage.getItem('jwt').split('.')[1]));
        setCurrentUser(jwtPayload.user_id || jwtPayload.user);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    let ws = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    const connectWebSocket = () => {
      if (ws) {
        ws.close();
      }

      ws = new WebSocket(`ws://localhost:8000/ws/communication/?token=${token}`);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('📡 WebSocket connection established');
        retryCount = 0;
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(connectWebSocket, retryDelay * retryCount);
        } else {
          console.error('Max WebSocket connection retries reached');
          alert('Lost connection to chat server. Please refresh the page.');
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [users, activeFriend]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.action) {
      case 'user_online':
        setOnlineUsers(prev => new Set([...prev, data.user.user_id]));
        break;
      case 'user_offline':
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.user.user_id);
          return newSet;
        });
        break;
      case 'chat_message_received':
        handleIncomingMessage(data);
        break;
      case 'incoming_call':
        handleIncomingCall(data);
        break;
      case 'call_answered':
        if (pcRef.current) {
          pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
            .then(() => {
              setInCall(true);
              setCallStatus('connected');
            })
            .catch((err) => console.error('Error setting remote description:', err));
        }
        break;
      case 'ice':
        if (pcRef.current && pcRef.current.remoteDescription) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch((err) => console.error('Error adding ICE:', err));
        }
        break;
      case 'hangup':
        cleanupCall();
        break;
      case 'call_ended':
        handleCallEnded(data);
        break;
      case 'user_typing':
        handleUserTyping(data);
        break;
      // Add other message handlers as needed
    }
  };

  // Handle incoming chat messages
  const handleIncomingMessage = (data) => {
    const message = data.message || data;
    if (message.message_id && hasProcessedEvent(message.message_id, 'message')) {
      return;
    }

    setChatMessages(prevMessages => {
      const messageExists = prevMessages.some(m => m.message_id === message.message_id);
      if (!messageExists) {
        const sender = users.find(u => u.user_id === message.sender_id);
        if (sender && (!activeFriend || activeFriend.user_id !== message.sender_id)) {
          setUnreadMessages(prev => ({
            ...prev,
            [message.sender_id]: (prev[message.sender_id] || 0) + 1
          }));
          
          addNotification({
            type: 'message',
            senderId: message.sender_id,
            messageId: message.message_id,
            title: `New message from ${sender.username}`,
            message: typeof message.content === 'string' 
              ? message.content 
              : `Sent you a ${message.message_type === 'image' ? 'image' : 'file'}`,
            onClick: () => openChat(sender)
          });
        }
        return [...prevMessages, message];
      }
      return prevMessages;
    });
  };

  // Handle incoming calls
  const handleIncomingCall = (data) => {
    const callId = `${data.from_user}_${data.offer?.sdp || Date.now()}`;
    if (hasProcessedEvent(callId, 'call')) return;

    activeCallIds.current.add(callId);
    pendingCalls.current.set(callId, {
      callerId: data.from_user,
      timestamp: Date.now(),
      offer: data.offer
    });

    // Show incoming call modal immediately
    setIncomingOffer(data.offer);
    setRemoteUser(data.from_user);

    // Still push a notification so the user can notice if the chat sidebar is closed
    const caller = users.find(u => u.user_id === data.from_user);
    addNotification({
      type: 'call',
      senderId: data.from_user,
      callId: callId,
      title: `Incoming call from ${caller?.username || 'User'}`,
      message: 'Incoming call...',
      onClick: () => {
        // Focus the chat sidebar and keep the modal open
        setIsOpen(true);
      }
    });
  };

  // Handle call ended
  const handleCallEnded = (data) => {
    const caller = users.find(u => u.user_id === data.from_user);
    addNotification({
      type: 'call',
      senderId: data.from_user,
      callId: `${data.from_user}_ended_${Date.now()}`,
      title: `Call ended with ${caller?.username || 'User'}`,
      message: 'Click to call back',
      onClick: () => startCall(data.from_user)
    });
    cleanupCall();
  };

  // Handle user typing
  const handleUserTyping = (data) => {
    if (data.sender_id && data.sender_id !== currentUser) {
      setIsTyping(prev => ({
        ...prev,
        [data.sender_id]: true
      }));
      
      if (typingTimeoutRef.current[data.sender_id]) {
        clearTimeout(typingTimeoutRef.current[data.sender_id]);
      }
      
      typingTimeoutRef.current[data.sender_id] = setTimeout(() => {
        setIsTyping(prev => ({
          ...prev,
          [data.sender_id]: false
        }));
      }, 3000);
    }
  };

  // Open chat with a user
  const openChat = (user) => {
    setActiveFriend(user);
    setIsOpen(true);
    
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[user.user_id];
      return newUnread;
    });
    
    loadChatHistory(user.user_id);
  };

  // Load chat history
  const loadChatHistory = async (userId) => {
    if (!userId || !currentUser) return;
    
    setIsLoadingMessages(true);
    try {
      const conversationId = [currentUser, userId].sort().join('_');
      const response = await API.get(`/get_messages/${conversationId}`);
      if (response.data.status === 'success') {
        setChatMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || !activeFriend || !wsRef.current) return;

    const timestamp = new Date().toISOString();
    const conversationId = [currentUser, activeFriend.user_id].sort().join('_');
    const messageId = `${conversationId}_${currentUser}_${timestamp}`;
    
    const messagePayload = {
      action: 'send_chat_message',
      recipient_id: activeFriend.user_id,
      sender_id: currentUser,
      conversation_id: conversationId,
      message_type: 'text',
      content: currentMessage.trim(),
      timestamp: timestamp,
      message_id: messageId
    };

    try {
      setCurrentMessage('');
      
      const optimisticMessage = {
        ...messagePayload,
        status: 'sending'
      };
      
      setChatMessages(prevMessages => {
        if (prevMessages.some(m => m.message_id === messageId)) {
          return prevMessages;
        }
        return [...prevMessages, optimisticMessage].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
      
      wsRef.current.send(JSON.stringify({
        ...messagePayload,
        target: activeFriend.user_id
      }));
      
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageStatus(prev => ({
        ...prev,
        [messageId]: 'error'
      }));
    }
  };

  // Start a call
  const startCall = async (userId) => {
    if (!userId || inCall) return;

    try {
      console.log('Starting call to', userId);
      setRemoteUser(userId);
      setCallStatus('ringing');
      setInCall(true);
      setMicOn(true);
      setCameraOn(true);

      // 1. Create peer connection
      pcRef.current = createPeerConnection();

      // 2. Get local media
      const stream = await getDefaultStream();
      setLocalStream(stream);
      stream.getTracks().forEach(t => pcRef.current.addTrack(t, stream));
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 3. Create offer
      const offer = await pcRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(offer);

      // 4. Send offer via WebSocket
      wsRef.current?.send(
        JSON.stringify({
          action: 'call',
          target: userId,
          offer: pcRef.current.localDescription,
          from_user: currentUser,
          create_call_record: true,
        })
      );
    } catch (err) {
      console.error('Error starting call:', err);
      alert('Failed to start call: ' + err.message);
      endCall();
    }
  };

  // Cleanup call
  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s?.track?.stop?.());
      pcRef.current.getReceivers().forEach((r) => r?.track?.stop?.());
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    setLocalStream(null);
    setRemoteUser(null);
    setInCall(false);
    setCallStatus(null);
    setIncomingOffer(null);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.user_id !== currentUser && 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const uniqueUsers = React.useMemo(
  () => Array.from(new Map(filteredUsers.map(u => [u.user_id, u])).values()),
  [filteredUsers]
  );

  // Handle file selection and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeFriend) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 10MB limit');
      e.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sender_id', currentUser);
    formData.append('recipient_id', activeFriend.user_id);

    const timestamp = new Date().toISOString();
    const conversationId = [currentUser, activeFriend.user_id].sort().join('_');
    const messageId = `${conversationId}_${currentUser}_${timestamp}`;
    
    const optimisticMessage = {
      _id: `temp_${messageId}`,
      message_id: messageId,
      sender_id: currentUser,
      recipient_id: activeFriend.user_id,
      conversation_id: conversationId,
      message_type: file.type.startsWith('image/') ? 'image' : 'file',
      content: {
        filename: file.name,
        file_type: file.type,
        size: file.size,
        status: 'uploading'
      },
      timestamp: timestamp,
      status: 'sending'
    };

    setChatMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setMessageStatus(prev => ({
      ...prev,
      [messageId]: 'sending'
    }));

    try {
      const res = await API.post('/chat/upload_file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setMessageStatus(prev => ({
            ...prev,
            [messageId]: `uploading_${percentCompleted}`
          }));
        }
      });

      if (res.data.status === 'success') {
        const fileMessage = {
          action: 'send_chat_message',
          recipient_id: activeFriend.user_id,
          sender_id: currentUser,
          conversation_id: conversationId,
          message_type: res.data.file_type.startsWith('image/') ? 'image' : 'file',
          content: {
            url: res.data.url,
            filename: res.data.filename,
            file_type: res.data.file_type,
            size: res.data.size,
            stored_filename: res.data.stored_filename
          },
          timestamp: timestamp,
          message_id: messageId,
          target: activeFriend.user_id
        };

        wsRef.current?.send(JSON.stringify(fileMessage));
      } else {
        throw new Error(res.data.message || 'Failed to upload file');
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setMessageStatus(prev => ({
        ...prev,
        [messageId]: 'error'
      }));
      alert("Failed to upload file: " + (err.message || 'Unknown error'));
    } finally {
      e.target.value = null;
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingOffer || !remoteUser) return;

    try {
      console.log('Accepting call from', remoteUser);
      setInCall(true);
      setCallStatus('connected');
      setMicOn(true);
      setCameraOn(true);

      // 1. Create peer connection
      pcRef.current = createPeerConnection();

      // 2. Get local media
      const stream = await getDefaultStream();
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 3. Set remote description (offer)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // 4. Create answer
      const answer = await pcRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(answer);

      // 5. Send answer via WebSocket
      wsRef.current?.send(
        JSON.stringify({
          action: 'answer',
          target: remoteUser,
          answer: pcRef.current.localDescription,
          from_user: currentUser,
          update_call_record: true,
        })
      );

      setIncomingOffer(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      alert('Failed to accept call: ' + err.message);
      endCall();
    }
  };

  // Decline incoming call
  const declineCall = () => {
    if (remoteUser && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          action: 'hangup',
          target: remoteUser,
          from_user: currentUser,
          declined: true,
        })
      );
    }
    cleanupCall();
  };

  // ────────────── WebRTC helper functions ──────────────
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && remoteUser) {
        wsRef.current?.send(
          JSON.stringify({
            action: 'ice',
            target: remoteUser,
            candidate: e.candidate,
          })
        );
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = new MediaStream();
        }
        const remoteStream = remoteVideoRef.current.srcObject;
        if (remoteStream instanceof MediaStream) {
          const alreadyHasTrack = remoteStream
            .getTracks()
            .some((t) => t.id === e.track.id);
          if (!alreadyHasTrack) {
            remoteStream.addTrack(e.track);
          }
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (['failed', 'disconnected'].includes(pc.connectionState)) {
        endCall();
      }
    };

    return pc;
  };

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    });
  };

  const endCall = () => {
    if (remoteUser && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          action: 'hangup',
          target: remoteUser,
          from_user: currentUser,
        })
      );
    }
    cleanupCall();
  };

  return (
    <div>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        <FaRegCommentDots size={24} />
        {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>

      {/* Chat sidebar */}
      <div
        className={`fixed bottom-0 right-0 w-[700px] h-[600px] bg-white text-black shadow-2xl rounded-tl-xl transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full">
          {/* Users list */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {uniqueUsers.map(user => (
                <div
                  key={user.user_id}
                  onClick={() => openChat(user)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    activeFriend?.user_id === user.user_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      onlineUsers.has(user.user_id) ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  {unreadMessages[user.user_id] > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadMessages[user.user_id]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              {activeFriend ? (
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">Chat with {activeFriend.username}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startCall(activeFriend.user_id)}
                      className="p-2 hover:bg-blue-700 rounded-full"
                      title="Video Call"
                    >
                      <FaVideo />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="font-semibold">Select a user to start chatting</span>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            >
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.message_id || msg._id}
                    className={`flex ${msg.sender_id === currentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                        msg.sender_id === currentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-black'
                      } ${messageStatus[msg.message_id] === 'error' ? 'border-2 border-red-500' : ''}`}
                    >
                      {typeof msg.content === 'string' ? (
                        msg.content
                      ) : msg.message_type === 'image' && msg.content.url ? (
                        <img
                          src={msg.content.url}
                          alt="Shared image"
                          className="max-w-full rounded"
                          onClick={() => window.open(msg.content.url, '_blank')}
                        />
                      ) : (
                        <a
                          href={msg.content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          📎 {msg.content.filename}
                        </a>
                      )}
                      {msg.sender_id === currentUser && (
                        <span className="text-xs opacity-75 ml-2">
                          {messageStatus[msg.message_id] === 'sending' && '🕒'}
                          {messageStatus[msg.message_id] === 'sent' && '✓'}
                          {messageStatus[msg.message_id] === 'delivered' && '✓✓'}
                          {messageStatus[msg.message_id] === 'error' && '❌'}
                        </span>
                      )}
                      <span className="text-xs opacity-50 block mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isTyping[activeFriend?.user_id] && (
                <div className="text-sm text-gray-500 animate-pulse">
                  {activeFriend.username} is typing...
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="chat-file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="chat-file-input"
                  className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <FaPaperclip size={20} />
                </label>
              <input
                type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    currentMessage.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call modal */}
      {inCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Call with {users.find(u => u.user_id === remoteUser)?.username || 'User'}
              </h3>
              <button
                onClick={endCall}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            {callStatus === 'ringing' && (
              <div className="text-center text-lg text-blue-500 font-semibold animate-pulse">
                Calling...
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 bg-black rounded-lg"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You {micOn ? '🎤' : '🔇'} {cameraOn ? '📹' : '🚫'}
                </div>
              </div>
              <div className="relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-lg"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {users.find(u => u.user_id === remoteUser)?.username || 'Remote User'}
                </div>
            </div>
          </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={toggleMic}
                className={`px-4 py-2 rounded-full ${
                  micOn
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {micOn ? '🎤 Mute' : '🔇 Unmute'}
              </button>
              <button
                onClick={toggleCamera}
                className={`px-4 py-2 rounded-full ${
                  cameraOn
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {cameraOn ? '📹 Camera Off' : '🚫 Camera On'}
              </button>
              <button
                onClick={endCall}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600"
              >
                End Call
              </button>
            </div>
          </div>
                  </div>
      )}

      {/* Incoming call modal */}
      {incomingOffer && !inCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <h3 className="text-xl font-semibold mb-4">
              Incoming call from {users.find(u => u.user_id === remoteUser)?.username || 'User'}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 flex items-center gap-2"
              >
                <FaPhone /> Accept
              </button>
              <button
                onClick={declineCall}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 flex items-center gap-2"
              >
                <FaTimes /> Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
