import React, { useEffect, useState, useRef, useCallback } from 'react';
import API from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

export default function CommunicationHub() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  // Chat state
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState({});
  const [chatNotifications, setChatNotifications] = useState({});

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);

  // Add message handling state
  const [messageStatus, setMessageStatus] = useState({});
  const [isTyping, setIsTyping] = useState({});
  const typingTimeoutRef = useRef({});

  // Add call status state
  const [callStatus, setCallStatus] = useState(null); // 'ringing', 'connected', null

  // Add call ended notification state
  const [callEndedNotification, setCallEndedNotification] = useState(false);

  // Add download status state
  const [downloadStatus, setDownloadStatus] = useState({});

  // Add image viewer state
  const [selectedImage, setSelectedImage] = useState(null);

  // Add inline preview state
  const [inlinePreview, setInlinePreview] = useState(null);

  // Add call quality monitoring state
  const [callQuality, setCallQuality] = useState({
    video_quality: 'unknown',
    audio_quality: 'unknown',
    network_quality: 'unknown'
  });

  // Add call quality monitoring interval ref
  const qualityMonitorInterval = useRef(null);

  // Add these refs at the top with other refs
  const signalingState = useRef(null);
  const processedMessageIds = useRef(new Set());
  const processedCallIds = useRef(new Set());
  const activeCallIds = useRef(new Set());
  const pendingCalls = useRef(new Map()); // Track pending calls with timestamps

  // Add notification timestamp tracking to prevent duplicates
  const [lastNotificationTimes, setLastNotificationTimes] = useState({});

  const { addNotification } = useNotifications();

  // Add chat container ref with other refs
  const chatContainerRef = useRef(null);

  // Add this helper function to check if an event has been processed
  const hasProcessedEvent = (eventId, type) => {
    const ref = type === 'message' ? processedMessageIds : processedCallIds;
    if (ref.current.has(eventId)) {
      return true;
    }
    ref.current.add(eventId);
    // Clean up old IDs periodically (keep last 1000)
    if (ref.current.size > 1000) {
      const idsToKeep = Array.from(ref.current).slice(-1000);
      ref.current = new Set(idsToKeep);
    }
    return false;
  };

  // Add scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Add effect to scroll when chat messages change
  useEffect(() => {
    if (showChatWindow && !isLoadingMessages) {
      scrollToBottom();
    }
  }, [chatMessages, showChatWindow, isLoadingMessages, scrollToBottom]);

  // get list of users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await API.get('/users');
        setUsers(res.data);
        // Assume backend returns current user as part of list or parse from localStorage
        const jwtPayload = JSON.parse(atob(localStorage.getItem('jwt').split('.')[1]));
        setCurrentUser(jwtPayload.user_id || jwtPayload.user);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
  }, []);

  // setup websocket
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
          console.log(`Retrying WebSocket connection (${retryCount}/${maxRetries})...`);
          setTimeout(connectWebSocket, retryDelay * retryCount);
        } else {
          console.error('Max WebSocket connection retries reached');
          alert('Lost connection to chat server. Please refresh the page.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        switch (data.action) {
          case 'online_users_list':
            // Update all users' online status based on the received list
            setUsers(prev => prev.map(user => ({
              ...user,
              status: data.users.includes(user.user_id) ? 'online' : 'offline'
            })));
            break;
          case 'user_online':
            // ... existing code ...
            break;
          case 'chat_message_received':
            console.log('Received chat message:', data);
            const message = data.message || data;
            if (message.message_id) {
              // Skip if we've already processed this message ID
              if (hasProcessedEvent(message.message_id, 'message')) {
                console.log('Skipping duplicate message:', message.message_id);
                return;
              }
              
              // Update existing message if it's an optimistic one, otherwise add new message
              setChatMessages(prevMessages => {
                const existingMessageIndex = prevMessages.findIndex(m => m.message_id === message.message_id);
                if (existingMessageIndex !== -1) {
                  // Update the existing optimistic message
                  const updatedMessages = [...prevMessages];
                  updatedMessages[existingMessageIndex] = {
                    ...message,
                    timestamp: message.timestamp || new Date().toISOString(),
                    status: 'delivered',
                    sender_id: message.sender_id || data.from_user,
                    recipient_id: currentUser,
                    content: message.content,
                    message_type: message.message_type || 'text'
                  };
                  return updatedMessages;
                } else {
                  // Add new message
                  const newMessage = {
                    ...message,
                    timestamp: message.timestamp || new Date().toISOString(),
                    status: 'delivered',
                    sender_id: message.sender_id || data.from_user,
                    recipient_id: currentUser,
                    content: message.content,
                    message_type: message.message_type || 'text'
                  };
                  return [...prevMessages, newMessage].sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                  );
                }
              });

              // Send delivery confirmation
              wsRef.current?.send(JSON.stringify({
                action: 'message_delivered',
                message_id: message.message_id,
                sender_id: message.sender_id || data.from_user,
                recipient_id: currentUser
              }));

              // Create notification for the new message
              const sender = users.find(u => u.user_id === (message.sender_id || data.from_user));
              addNotification({
                type: 'message',
                senderId: message.sender_id || data.from_user,
                messageId: message.message_id,
                title: `New message from ${sender?.username || 'User'}`,
                message: typeof message.content === 'string' 
                  ? message.content 
                  : `Sent you a ${message.message_type === 'image' ? 'image' : 'file'}`,
                onClick: () => {
                  if (sender) openChat(sender);
                }
              });

              // Update unread count
              setUnreadMessages(prev => ({
                ...prev,
                [message.sender_id || data.from_user]: (prev[message.sender_id || data.from_user] || 0) + 1
              }));
              
              // Update chat notifications banner
              setChatNotifications(prev => {
                const newNotifications = { ...prev };
                newNotifications[message.sender_id || data.from_user] = {
                  message: typeof message.content === 'string' 
                    ? message.content 
                    : `Sent you a file: ${message.content.filename}`,
                  timestamp: message.timestamp
                };
                return newNotifications;
              });
            }
            break;
            
          case 'incoming_call':
            console.log('Received incoming call from:', data.from_user);
            // Generate a unique call ID for this call attempt
            const callId = `${data.from_user}_${data.offer?.sdp || Date.now()}`;
            
            // Skip if we've already processed this call
            if (hasProcessedEvent(callId, 'call')) {
              console.log('Skipping duplicate call notification:', callId);
              return;
            }
            
            // Add to active calls and pending calls with timestamp
            activeCallIds.current.add(callId);
            pendingCalls.current.set(callId, {
              callerId: data.from_user,
              timestamp: Date.now(),
              offer: data.offer
            });
            
            const caller = users.find(u => u.user_id === data.from_user);
            addNotification({
              type: 'call',
              senderId: data.from_user,
              callId: callId,
              title: `Incoming call from ${caller?.username || 'User'}`,
              message: 'Click to answer',
              onClick: () => {
                setIncomingOffer(data.offer);
                setRemoteUser(data.from_user);
              }
            });
            setIncomingOffer(data.offer);
            setRemoteUser(data.from_user);
            break;
            
          case 'call_answered':
            console.log('Call answered, setting remote description...', data);
            // Remove from pending calls when answered
            const answeredPendingCallId = Array.from(pendingCalls.current.keys())
              .find(id => id.startsWith(data.from_user));
            if (answeredPendingCallId) {
              pendingCalls.current.delete(answeredPendingCallId);
            }
            
            if (!pcRef.current) {
                console.error('No peer connection available');
                return;
            }

            // Update signaling state ref
            signalingState.current = pcRef.current.signalingState;
            console.log('Current signalingState:', signalingState.current);

            // Only process answer if we're in the correct state
            if (signalingState.current === 'have-local-offer') {
                pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
                    .then(() => {
                        console.log('Remote description set successfully');
                        setRemoteUser(data.from_user);
                        setInCall(true);
                        setCallStatus('connected');
                        
                        // Force refresh of UI
                        setTimeout(() => {
                            console.log('Call UI should be visible now');
                            setInCall(prevState => {
                                if (prevState) return prevState;
                                return true;
                            });
                        }, 500);
                        
                        // Ensure UI displays correctly
                        if (remoteVideoRef.current && pcRef.current.getReceivers().length > 0) {
                            console.log('Setting up remote video stream after call acceptance');
                            const remoteStream = new MediaStream();
                            pcRef.current.getReceivers().forEach(receiver => {
                                if (receiver.track) {
                                    remoteStream.addTrack(receiver.track);
                                }
                            });
                            remoteVideoRef.current.srcObject = remoteStream;
                        }
                    })
                    .catch(error => {
                        console.error('Error setting remote description:', error);
                        // Only end call if it's a state error and we're not already stable
                        if (error.name === 'InvalidStateError' && signalingState.current !== 'stable') {
                            endCall();
                        }
                    });
            } else {
                console.log('Ignoring answer in state:', signalingState.current);
            }
            break;
            
          case 'ice':
            if (pcRef.current && pcRef.current.remoteDescription) {
              pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(error => console.error('Error adding ICE candidate:', error));
            }
            break;
            
          case 'hangup':
            console.log('Received hangup signal from:', data.from_user);
            
            // Check if this was a pending call that wasn't answered
            const hangupPendingCallId = Array.from(pendingCalls.current.keys())
              .find(id => id.startsWith(data.from_user));
            
            if (hangupPendingCallId) {
              const pendingCall = pendingCalls.current.get(hangupPendingCallId);
              const now = Date.now();
              const callDuration = Math.round((now - pendingCall.timestamp) / 1000);
              
              // Create missed call notification for caller hangup
              const caller = users.find(u => u.user_id === data.from_user);
              addNotification({
                type: 'missed_call',
                senderId: data.from_user,
                callId: `${data.from_user}_missed_${now}`,
                title: `Missed call from ${caller?.username || 'User'}`,
                message: `Caller hung up after ${callDuration} seconds`,
                timestamp: pendingCall.timestamp,
                onClick: () => {
                  startCall(data.from_user);
                }
              });
              
              // Remove from pending calls
              pendingCalls.current.delete(hangupPendingCallId);
            }
            
            // Clear active calls and cleanup
            activeCallIds.current.clear();
            cleanupCall();
            break;
            
          case 'user_created':
          case 'user_updated':
            addOrUpdateUser(data.user);
            break;
            
          // Add handler for real-time chat messages
          case 'send_chat_message':
            console.log('Received chat message:', data);
            // Skip if we've already processed this message
            if (data.message?.message_id && hasProcessedEvent(data.message.message_id, 'message')) {
              console.log('Skipping duplicate message notification:', data.message.message_id);
              return;
            }
            handleIncomingMessage(data);
            break;
            
          case 'message_sent':
            console.log('Message sent confirmation:', data);
            if (data.message?.message_id) {
              setMessageStatus(prev => ({
                ...prev,
                [data.message.message_id]: 'sent'
              }));
            }
            break;
            
          case 'message_delivered':
            console.log('Message delivered:', data);
            if (data.message_id) {
              setMessageStatus(prev => ({
                ...prev,
                [data.message_id]: 'delivered'
              }));
            }
            break;
            
          case 'user_typing':
            if (data.sender_id && data.sender_id !== currentUser) {
              setIsTyping(prev => ({
                ...prev,
                [data.sender_id]: true
              }));
              
              // Clear typing indicator after a timeout
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
            break;

          case 'missed_call':
            const missedCaller = users.find(u => u.user_id === data.from_user);
            const missedCallId = `${data.from_user}_missed_${Date.now()}`;
            
            // Get the pending call info if it exists
            const missedPendingCallId = Array.from(pendingCalls.current.keys())
              .find(id => id.startsWith(data.from_user));
            const pendingCall = missedPendingCallId ? pendingCalls.current.get(missedPendingCallId) : null;
            
            // Only show missed call notification if we haven't shown one recently
            const now = Date.now();
            const lastMissedCallTime = lastNotificationTimes[`missed_call_${data.from_user}`] || 0;
            
            if (now - lastMissedCallTime > 5000) {
              // Update the last notification time
              setLastNotificationTimes(prev => ({
                ...prev,
                [`missed_call_${data.from_user}`]: now
              }));
              
              // Create missed call notification with call duration if available
              const callDuration = pendingCall 
                ? Math.round((now - pendingCall.timestamp) / 1000) 
                : null;
              
              addNotification({
                type: 'missed_call',
                senderId: data.from_user,
                callId: missedCallId,
                title: `Missed call from ${missedCaller?.username || 'User'}`,
                message: callDuration 
                  ? `Call rang for ${callDuration} seconds` 
                  : 'Click to call back',
                timestamp: pendingCall?.timestamp || now,
                onClick: () => {
                  startCall(data.from_user);
                }
              });
              
              // Remove from pending calls
              if (missedPendingCallId) {
                pendingCalls.current.delete(missedPendingCallId);
              }
            }
            break;

          case 'call_ended':
            const endedCaller = users.find(u => u.user_id === data.from_user);
            const endedCallId = `${data.from_user}_ended_${Date.now()}`;
            
            // Only show call ended notification if we haven't shown one recently
            const nowForCallEnded = Date.now();
            const lastCallEndedTime = lastNotificationTimes[`call_ended_${data.from_user}`] || 0;
            
            if (nowForCallEnded - lastCallEndedTime > 5000) {
              // Update the last notification time
              setLastNotificationTimes(prev => ({
                ...prev,
                [`call_ended_${data.from_user}`]: nowForCallEnded
              }));
              
              addNotification({
                type: 'call',
                senderId: data.from_user,
                callId: endedCallId,
                title: `Call ended with ${endedCaller?.username || 'User'}`,
                message: 'Click to call back',
                onClick: () => {
                  startCall(data.from_user);
                }
              });
            }
            break;
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [users, chatTargetUser, addNotification]);

  useEffect(() => {
    console.log('Call state updated:', { inCall, remoteUser, callStatus });
  }, [inCall, remoteUser, callStatus]);

  // helper to safely merge new user
  const addOrUpdateUser = (u) => {
    setUsers((prev) => {
      const exists = prev.find((item) => item.user_id === u.user_id);
      if (exists) {
        return prev.map((item) => (item.user_id === u.user_id ? { ...item, ...u } : item));
      }
      return [...prev, u];
    });
  };

  const createPeerConnection = () => {
    console.log('Creating new peer connection...');
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && remoteUser) {
        console.log('Sending ICE candidate:', e.candidate);
        wsRef.current?.send(JSON.stringify({
          action: 'ice',
          target: remoteUser,
          candidate: e.candidate,
        }));
      } else if (!e.candidate) {
        console.log('ICE gathering completed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.error('ICE connection failed or disconnected:', pc.iceConnectionState);
        // Don't end call immediately, wait for a short timeout to allow recovery
        setTimeout(() => {
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
            console.log('ICE connection still failed after timeout, ending call');
            endCall();
          }
        }, 5000);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    pc.onsignalingstatechange = () => {
      signalingState.current = pc.signalingState;
      console.log('Signaling state changed:', signalingState.current);
    };

    pc.ontrack = (e) => {
      console.log('Received remote track:', e.track.kind, e.streams);
      if (remoteVideoRef.current) {
        console.log('Setting remote video from ontrack event');
        if (!remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = new MediaStream();
        }
        // Add this track to the existing stream
        const existingStream = remoteVideoRef.current.srcObject;
        if (existingStream instanceof MediaStream) {
          // Only add the track if it doesn't already exist in the stream
          const trackExists = Array.from(existingStream.getTracks()).some(
            t => t.id === e.track.id
          );
          if (!trackExists) {
            existingStream.addTrack(e.track);
            console.log(`Added ${e.track.kind} track to remote stream`);
          }
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.error('Connection failed or disconnected:', pc.connectionState);
        // Don't end call immediately, wait for a short timeout to allow recovery
        setTimeout(() => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            console.log('Connection still failed after timeout, ending call');
            endCall();
          }
        }, 5000);
      }
    };

    return pc;
  };

  const startCall = async (userId) => {
    try {
      console.log('Starting call to user:', userId);
      setRemoteUser(userId);
      setCallStatus('ringing');
      
      // Set inCall state immediately to show the call UI for the caller
      setInCall(true);
      setMicOn(true);
      setCameraOn(true);
      
      // Create peer connection first
      pcRef.current = createPeerConnection();
      
      // Get media stream
      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      console.log('Media stream obtained:', stream.getTracks().map(t => t.kind));
      
      setLocalStream(stream);
      stream.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind, track.id);
        pcRef.current.addTrack(track, stream);
      });
      
      if (localVideoRef.current) {
        console.log('Setting local video stream');
        localVideoRef.current.srcObject = stream;
      }

      // Create and set local offer
      console.log('Creating offer...');
      try {
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        console.log('Offer created:', offer);
        
        console.log('Setting local description...');
        await pcRef.current.setLocalDescription(offer);
        console.log('Local description set successfully');
      } catch (error) {
        console.error('Error creating/setting offer:', error);
        throw error;
      }

      // Send the offer to the other peer with call record creation
      console.log('Sending offer to peer...');
      if (!wsRef.current) {
        throw new Error('WebSocket connection not available');
      }
      wsRef.current.send(JSON.stringify({
        action: 'call',
        target: userId,
        offer: pcRef.current.localDescription,
        from_user: currentUser,
        create_call_record: true
      }));
      console.log('Offer sent successfully');
      
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to start call: ' + error.message);
      endCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingOffer) {
      console.error('No incoming offer available');
      return;
    }
    
    try {
      console.log('Accepting call from:', remoteUser);
      console.log('Incoming offer:', incomingOffer);
      
      // Set inCall state immediately to show the call UI
      setInCall(true);
      setCallStatus('connected');
      setMicOn(true);
      setCameraOn(true);
      
      // Create peer connection first
      pcRef.current = createPeerConnection();
      
      // Get media stream
      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      console.log('Media stream obtained:', stream.getTracks().map(t => t.kind));
      
      setLocalStream(stream);
      stream.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind, track.id);
        pcRef.current.addTrack(track, stream);
      });
      
      if (localVideoRef.current) {
        console.log('Setting local video stream');
        localVideoRef.current.srcObject = stream;
      }

      // Set remote description (the offer)
      console.log('Setting remote description...');
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
        console.log('Remote description set successfully');
      } catch (error) {
        console.error('Error setting remote description:', error);
        throw error;
      }
      
      // Create and set local description (the answer)
      console.log('Creating answer...');
      try {
        const answer = await pcRef.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        console.log('Answer created:', answer);
        
        console.log('Setting local description...');
        await pcRef.current.setLocalDescription(answer);
        console.log('Local description set successfully');
      } catch (error) {
        console.error('Error creating/setting answer:', error);
        throw error;
      }

      // Send the answer with call record update
      console.log('Sending answer to peer...');
      if (!wsRef.current) {
        throw new Error('WebSocket connection not available');
      }
      wsRef.current.send(JSON.stringify({
        action: 'answer',
        target: remoteUser,
        answer: pcRef.current.localDescription,
        from_user: currentUser,
        update_call_record: true
      }));
      console.log('Answer sent successfully');

      setIncomingOffer(null);
      
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call: ' + error.message);
      endCall();
    }
  };

  const declineCall = () => {
    if (remoteUser) {
      wsRef.current?.send(JSON.stringify({
        action: 'hangup',
        target: remoteUser,
        from_user: currentUser,
        end_call_record: true, // Signal to end call record
        declined: true // Add declined flag
      }));
    }
    setIncomingOffer(null);
  };

  const endCall = () => {
    console.log('Ending call and cleaning up...');
    
    // Notify other user if we're the one ending the call - do this FIRST
    if (remoteUser && wsRef.current) {
      console.log('Sending hangup notification to:', remoteUser);
      wsRef.current.send(JSON.stringify({
        action: 'hangup',
        target: remoteUser,
        from_user: currentUser,
        end_call_record: true, // Signal to end call record
        quality_metrics: callQuality // Include final quality metrics
      }));
      
      // Small delay to ensure the message is sent before cleanup
      setTimeout(() => {
        cleanupCall();
      }, 100);
    } else {
      cleanupCall();
    }
  };

  // Extract the cleanup logic to a separate function so it can be called directly from the hangup handler
  const cleanupCall = () => {
    // Stop and clear all local media tracks
    if (localStream) {
      console.log('Stopping local media tracks...');
      localStream.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
        // Release the track to reset permissions
        track.enabled = false;
      });
      // Clear the stream using state setter
      setLocalStream(null);
    }

    // Clear video elements and their streams
    if (localVideoRef.current) {
      if (localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      }
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      }
      remoteVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (pcRef.current) {
      console.log('Closing peer connection...');
      // Stop all transceivers
      pcRef.current.getTransceivers().forEach(transceiver => {
        if (transceiver.stop) {
          transceiver.stop();
        }
      });
      // Stop all senders
      pcRef.current.getSenders().forEach(sender => {
        if (sender.track) {
          sender.track.stop();
          sender.track.enabled = false;
        }
      });
      // Stop all receivers
      pcRef.current.getReceivers().forEach(receiver => {
        if (receiver.track) {
          receiver.track.stop();
          receiver.track.enabled = false;
        }
      });
      // Clear event handlers
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    // Reset state
    setInCall(false);
    setRemoteUser(null);
    setSharingScreen(false);
    setMicOn(false);
    setCameraOn(false);
    setIncomingOffer(null);
    
    // Show call ended notification
    setCallEndedNotification(true);
    setTimeout(() => setCallEndedNotification(false), 3000);

    // Add notification for ended call
    if (remoteUser) {
      const remoteUserData = users.find(u => u.user_id === remoteUser);
      addNotification({
        type: 'call',
        senderId: remoteUser,
        title: `Call ended with ${remoteUserData?.username || 'User'}`,
        message: 'Click to call back',
        onClick: () => {
          startCall(remoteUser);
        }
      });
    }

    // Reset quality state
    setCallQuality({
      video_quality: 'unknown',
      audio_quality: 'unknown',
      network_quality: 'unknown'
    });

    // Reset state tracking
    signalingState.current = null;

    // Force browser to release media devices
    navigator.mediaDevices.getUserMedia({ video: false, audio: false })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => console.log('Error releasing media devices:', err));
  };

  // ────────────── Controls ──────────────
  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    });
  };

  const toggleScreenShare = async () => {
    if (!pcRef.current) return;
    if (!sharingScreen) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
        screenTrack.onended = () => {
          toggleScreenShare();
        };
        if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;
        setSharingScreen(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      // revert to camera
      const cameraTrack = localStream?.getVideoTracks()[0];
      const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
      if (cameraTrack && sender) sender.replaceTrack(cameraTrack);
      if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
      setSharingScreen(false);
    }
  };

  // Message handling functions
  const handleIncomingMessage = (data) => {
    const message = data.message;
    const senderId = message.sender_id || data.from_user;
    
    // Skip if we've already processed this message
    if (message.message_id && hasProcessedEvent(message.message_id, 'message')) {
      console.log('Skipping duplicate message notification:', message.message_id);
      return;
    }

    setChatMessages(prevMessages => {
      const messageExists = prevMessages.some(m => m.message_id === message.message_id);
      
      if (!messageExists) {
        // For each new message, increment the unread counter
        setUnreadMessages(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));

        // Create notification for the new message
        const sender = users.find(u => u.user_id === senderId);
        addNotification({
          type: 'message',
          senderId: senderId,
          messageId: message.message_id,
          title: `New message from ${sender?.username || 'User'}`,
          message: typeof message.content === 'string' 
            ? message.content 
            : `Sent you a ${message.message_type === 'image' ? 'image' : 'file'}`,
          onClick: () => {
            if (sender) openChat(sender);
          }
        });

        // Update chat notification banner
        setChatNotifications(prev => {
          const newNotifications = { ...prev };
          newNotifications[senderId] = {
            message: typeof message.content === 'string' 
              ? message.content 
              : `Sent you a file: ${message.content.filename}`,
            timestamp: message.timestamp
          };
          return newNotifications;
        });
      }
      
      // Return updated messages array if it's a new message
      return messageExists ? prevMessages : [...prevMessages, message];
    });
  };

  const handleMessageSent = (message) => {
    // Update message status
    setMessageStatus(prev => ({
      ...prev,
      [message.message_id]: 'sent'
    }));
    
    // Add message to chat
    addMessageToChat(message);
  };

  const handleMessageDelivered = (messageId) => {
    setMessageStatus(prev => ({
      ...prev,
      [messageId]: 'delivered'
    }));
  };

  const handleMessageError = (error) => {
    console.error('Message error:', error);
    alert('Failed to send message: ' + error);
  };

  const handleUserStatusChange = (data) => {
    const { user, event } = data;
    setUsers(prev => prev.map(u => 
      u.user_id === user.user_id 
        ? { ...u, status: event === 'user_online' ? 'online' : 'offline' }
        : u
    ));
  };

  // Update addMessageToChat to use the ref
  const addMessageToChat = (message) => {
    setChatMessages(prevMessages => {
      // Use message_id for deduplication
      const exists = prevMessages.some(m => m.message_id === message.message_id);
      if (!exists) {
        // Sort messages by timestamp
        const newMessages = [...prevMessages, message].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        return newMessages;
      }
      return prevMessages;
    });
  };

  // Update sendMessage to use the ref
  const sendMessage = async () => {
    if (!currentMessage.trim() || !chatTargetUser || !wsRef.current) return;

    const timestamp = new Date().toISOString();
    const conversationId = [currentUser, chatTargetUser.user_id].sort().join('_');
    const messageId = `${conversationId}_${currentUser}_${timestamp}`;
    
    const messagePayload = {
      action: 'send_chat_message',
      recipient_id: chatTargetUser.user_id,
      sender_id: currentUser,
      conversation_id: conversationId,
      message_type: 'text',
      content: currentMessage.trim(),
      timestamp: timestamp,
      message_id: messageId
    };

    try {
      // Clear input field immediately
      setCurrentMessage('');
      
      // Add optimistic message
      const optimisticMessage = {
        ...messagePayload,
        status: 'sending'
      };
      
      // Add message to chat immediately
      setChatMessages(prevMessages => {
        // Check if message already exists
        if (prevMessages.some(m => m.message_id === messageId)) {
          return prevMessages;
        }
        return [...prevMessages, optimisticMessage].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
      
      // Send via WebSocket
      wsRef.current.send(JSON.stringify({
        ...messagePayload,
        target: chatTargetUser.user_id
      }));
      
    } catch (err) {
      console.error("Error sending message:", err);
      setMessageStatus(prev => ({
        ...prev,
        [messageId]: 'error'
      }));
      alert("Failed to send message. Please try again.");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatTargetUser) return;

    // Add file size limit check (e.g., 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 10MB limit');
      e.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sender_id', currentUser);
    formData.append('recipient_id', chatTargetUser.user_id);

    // Create optimistic message
    const timestamp = new Date().toISOString();
    const conversationId = [currentUser, chatTargetUser.user_id].sort().join('_');
    const messageId = `${conversationId}_${currentUser}_${timestamp}`;
    
    const optimisticMessage = {
      _id: `temp_${messageId}`,
      message_id: messageId,
      sender_id: currentUser,
      recipient_id: chatTargetUser.user_id,
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

    // Add optimistic message to chat
    addMessageToChat(optimisticMessage);
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
          // Update message status with upload progress
          setMessageStatus(prev => ({
            ...prev,
            [messageId]: `uploading_${percentCompleted}`
          }));
        }
      });

      if (res.data.status === 'success') {
        // Send the file message via WebSocket
        const fileMessage = {
          action: 'send_chat_message',
          recipient_id: chatTargetUser.user_id,
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
          target: chatTargetUser.user_id
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
      e.target.value = null; // Reset file input
    }
  };

  // Add ImageViewer component
  const ImageViewer = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={image.url} 
            alt={image.filename}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black bg-opacity-50 text-white p-2 rounded-lg">
            <span className="text-sm truncate">{image.filename}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageDownload(image);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm ml-2"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add image download handler
  const handleImageDownload = async (image) => {
    try {
      const response = await fetch(image.url, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Update renderMessageContent to handle images with new layout
  const renderMessageContent = (msg) => {
    if (typeof msg.content === 'string') {
      return msg.content;
    }

    // Handle file/image messages
    const isImage = msg.message_type === 'image';
    const fileContent = msg.content;
    
    if (isImage && fileContent.url) {
      const imageData = {
        url: fileContent.url,
        filename: fileContent.filename
      };

      return (
        <div className="max-w-xs">
          {/* Image thumbnail */}
          <div className="relative">
            <img 
              src={fileContent.url} 
              alt={fileContent.filename}
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setInlinePreview(inlinePreview === fileContent.url ? null : fileContent.url)}
            />
            {/* Inline preview */}
            {inlinePreview === fileContent.url && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <img 
                  src={fileContent.url} 
                  alt={fileContent.filename}
                  className="max-w-full max-h-64 object-contain rounded"
                />
              </div>
            )}
          </div>
          
          {/* File info and controls */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-600 truncate flex-grow mr-2">{fileContent.filename}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInlinePreview(inlinePreview === fileContent.url ? null : fileContent.url);
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  inlinePreview === fileContent.url 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDownload(imageData);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Handle regular files
    const status = messageStatus[msg.message_id];
    const downloadState = downloadStatus[msg.message_id];
    const isUploading = status && status.startsWith('uploading_');
    const uploadProgress = isUploading ? parseInt(status.split('_')[1]) : null;

    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg">📎</span>
        <div className="flex-grow">
          <p className="font-medium">{fileContent.filename}</p>
          <p className="text-xs text-gray-500">
            {(fileContent.size / 1024).toFixed(1)} KB
          </p>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          {downloadState === 'downloading' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleFileDownload(fileContent);
          }}
          disabled={downloadState === 'downloading'}
          className={`px-3 py-1 rounded text-sm ${
            downloadState === 'downloading' 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : downloadState === 'downloaded'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {downloadState === 'downloading' 
            ? 'Downloading...' 
            : downloadState === 'downloaded'
              ? '✓ Downloaded'
              : downloadState === 'error'
                ? 'Retry'
                : 'Download'}
        </button>
      </div>
    );
  };

  // Add file download handler
  const handleFileDownload = async (fileContent) => {
    const messageId = fileContent.message_id;
    try {
      setDownloadStatus(prev => ({
        ...prev,
        [messageId]: 'downloading'
      }));

      const downloadUrl = fileContent.stored_filename 
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/chat/download/${fileContent.stored_filename}`
        : fileContent.url;

      const response = await fetch(downloadUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/octet-stream',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileContent.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus(prev => ({
        ...prev,
        [messageId]: 'downloaded'
      }));

    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadStatus(prev => ({
        ...prev,
        [messageId]: 'error'
      }));
      alert('Failed to download file. Please try again.');
    }
  };

  // Add notification component
  const NotificationBanner = () => {
    if (Object.keys(chatNotifications).length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {Object.entries(chatNotifications).map(([userId, notification]) => {
          const user = users.find(u => u.user_id === userId);
          if (!user) return null;

          return (
            <div 
              key={`${userId}_${notification.timestamp}`}
              className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500 max-w-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
                <button
                  onClick={() => openChat(user)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  Open Chat
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Update openChat function to scroll after loading messages
  const openChat = (user) => {
    setChatTargetUser(user);
    setShowChatWindow(true);
    
    // Clear notifications and unread count for this user
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[user.user_id];
      return newUnread;
    });
    
    setChatNotifications(prev => {
      const newNotifications = { ...prev };
      delete newNotifications[user.user_id];
      return newNotifications;
    });
    
    // Load chat history
    loadChatHistory(user.user_id);
  };

  // Update loadChatHistory to scroll after messages are loaded
  const loadChatHistory = async (userId) => {
    if (!userId || !currentUser) return;
    
    setIsLoadingMessages(true);
    try {
      const conversationId = [currentUser, userId].sort().join('_');
      const response = await API.get(`/get_messages/${conversationId}`);
      if (response.data.status === 'success') {
        // Clear existing messages and set new ones
        setChatMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Add call quality monitoring function
  const monitorCallQuality = () => {
    if (!pcRef.current || !inCall) return;

    const stats = {
      video_quality: 'good',
      audio_quality: 'good',
      network_quality: 'good'
    };

    // Get connection stats
    pcRef.current.getStats().then(statsReport => {
      let totalBitrate = 0;
      let packetLoss = 0;
      let roundTripTime = 0;
      let audioBitrate = 0;
      let videoBitrate = 0;

      statsReport.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          videoBitrate += report.bytesReceived * 8 / 1000; // kbps
        }
        if (report.type === 'inbound-rtp' && report.kind === 'audio') {
          audioBitrate += report.bytesReceived * 8 / 1000; // kbps
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          roundTripTime = report.currentRoundTripTime * 1000; // ms
          packetLoss = report.packetsLost / report.packetsSent;
        }
      });

      totalBitrate = audioBitrate + videoBitrate;

      // Assess video quality
      if (videoBitrate < 100) {
        stats.video_quality = 'poor';
      } else if (videoBitrate < 500) {
        stats.video_quality = 'fair';
      }

      // Assess audio quality
      if (audioBitrate < 20) {
        stats.audio_quality = 'poor';
      } else if (audioBitrate < 50) {
        stats.audio_quality = 'fair';
      }

      // Assess network quality
      if (roundTripTime > 300 || packetLoss > 0.1) {
        stats.network_quality = 'poor';
      } else if (roundTripTime > 150 || packetLoss > 0.05) {
        stats.network_quality = 'fair';
      }

      // Update state and send to server if changed
      if (JSON.stringify(stats) !== JSON.stringify(callQuality)) {
        setCallQuality(stats);
        if (remoteUser && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            action: 'call_quality_update',
            target: remoteUser,
            quality_metrics: stats
          }));
        }
      }
    });
  };

  // Start/stop quality monitoring when call state changes
  useEffect(() => {
    if (inCall && callStatus === 'connected') {
      // Start monitoring
      qualityMonitorInterval.current = setInterval(monitorCallQuality, 5000);
    } else {
      // Stop monitoring
      if (qualityMonitorInterval.current) {
        clearInterval(qualityMonitorInterval.current);
        qualityMonitorInterval.current = null;
      }
    }

    return () => {
      if (qualityMonitorInterval.current) {
        clearInterval(qualityMonitorInterval.current);
      }
    };
  }, [inCall, callStatus]);

  // Add quality indicators to the call UI
  const renderQualityIndicators = () => {
    const getQualityColor = (quality) => {
      switch (quality) {
        case 'good': return 'text-green-500';
        case 'fair': return 'text-yellow-500';
        case 'poor': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center space-x-2">
          <span className={getQualityColor(callQuality.video_quality)}>📹</span>
          <span className={getQualityColor(callQuality.audio_quality)}>🎤</span>
          <span className={getQualityColor(callQuality.network_quality)}>📡</span>
        </div>
      </div>
    );
  };

  // Clean up processed message IDs when component unmounts
  useEffect(() => {
    return () => {
      processedMessageIds.current.clear();
      processedCallIds.current.clear();
      activeCallIds.current.clear();
      pendingCalls.current.clear();
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Communication Hub</h1>
      
      {/* Add notification banner */}
      <NotificationBanner />

      {/* Call ended notification */}
      {callEndedNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded shadow-lg animate-fade-in-out">
          Call ended
        </div>
      )}

      {incomingOffer && !inCall && (
        <div className="mb-4 bg-blue-100 p-4 rounded">
          <p>{`Incoming call from user ${remoteUser}`}</p>
          <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 mr-2 rounded">Accept</button>
          <button onClick={declineCall} className="bg-red-500 text-white px-4 py-2 rounded">Decline</button>
        </div>
      )}

      {/* Show user list when not in call */}
      {!inCall ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.user_id !== currentUser).map((user) => (
            <div key={user.user_id} className="border p-4 rounded shadow relative">
              <p className="font-semibold">{user.username}</p>
              <button
                onClick={() => startCall(user.user_id)}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded mr-2 hover:bg-indigo-700"
              >
                Call
              </button>
              <button
                onClick={() => openChat(user)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 relative"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Call with {users.find(u => u.user_id === remoteUser)?.username || 'User'}
              </h3>
              <button 
                onClick={endCall}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {callStatus === 'ringing' && (
              <div className="flex justify-center items-center mb-4">
                <span className="text-lg text-blue-500 font-semibold animate-pulse">Calling...</span>
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
                {renderQualityIndicators()}
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
                onClick={toggleScreenShare} 
                className={`px-4 py-2 rounded-full ${
                  sharingScreen 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {sharingScreen ? '🖥️ Stop Share' : '🖥️ Share Screen'}
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

      {/* Chat Window Modal */}
      {showChatWindow && chatTargetUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Chat with {chatTargetUser.username}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowChatWindow(false);
                  setChatTargetUser(null);
                  setChatMessages([]);
                  setUnreadMessages(prev => ({
                    ...prev,
                    [chatTargetUser.user_id]: 0
                  }));
                  setChatNotifications(prev => {
                    const newNotifications = { ...prev };
                    delete newNotifications[chatTargetUser.user_id];
                    return newNotifications;
                  });
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Message display area */}
            <div 
              ref={chatContainerRef}
              className="h-64 overflow-y-auto border rounded p-3 mb-3 bg-gray-50 chat-messages-container"
            >
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg.message_id || msg._id} 
                    className={`mb-2 p-2 rounded-lg max-w-xs break-words relative ${
                      msg.sender_id === currentUser 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-gray-300 text-black mr-auto'
                    } ${messageStatus[msg.message_id] === 'error' ? 'border-2 border-red-500' : ''}`}
                  >
                    {renderMessageContent(msg)}
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
                ))
              )}
            </div>

            {/* Message input area */}
            <div className="flex items-center">
              <input 
                type="text" 
                value={currentMessage} 
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                placeholder="Type a message..." 
                className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="file" 
                id="chat-file-input"
                className="hidden" 
                onChange={handleFileSelect}
              />
              <label 
                htmlFor="chat-file-input" 
                className="p-2 border-t border-b border-gray-300 cursor-pointer hover:bg-gray-100"
              >
                📎
              </label>
              <button 
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className={`px-4 py-2 rounded-r-md ${
                  currentMessage.trim() 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ImageViewer component */}
      {selectedImage && (
        <ImageViewer 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
} 