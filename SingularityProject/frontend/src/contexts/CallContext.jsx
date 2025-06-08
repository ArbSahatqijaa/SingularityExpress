import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import API from '../services/api';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
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
  const processedCallIds = useRef(new Set());
  const activeCallIds = useRef(new Set());
  const pendingCalls = useRef(new Map());
  
  const { addNotification } = useNotifications();

  // Helper function to check if a call event has been processed
  const hasProcessedEvent = (eventId) => {
    if (processedCallIds.current.has(eventId)) {
      return true;
    }
    processedCallIds.current.add(eventId);
    if (processedCallIds.current.size > 1000) {
      const idsToKeep = Array.from(processedCallIds.current).slice(-1000);
      processedCallIds.current = new Set(idsToKeep);
    }
    return false;
  };

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    let ws = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    const connect = () => {
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
          setTimeout(connect, retryDelay * retryCount);
        } else {
          console.error('Max WebSocket connection retries reached');
          alert('Lost connection to chat server. Please refresh the page.');
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'incoming_call' || 
            data.action === 'call_answered' || 
            data.action === 'ice' || 
            data.action === 'hangup' || 
            data.action === 'call_ended') {
          handleWebSocketMessage(data);
        }
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.action) {
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
          pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
            .catch((err) => console.error('Error adding ICE:', err));
        }
        break;
      case 'hangup':
        cleanupCall();
        break;
      case 'call_ended':
        handleCallEnded(data);
        break;
    }
  };

  // Handle incoming calls
  const handleIncomingCall = async (data) => {
    const callId = `${data.from_user}_${data.offer?.sdp || Date.now()}`;
    if (hasProcessedEvent(callId)) return;

    activeCallIds.current.add(callId);
    pendingCalls.current.set(callId, {
      callerId: data.from_user,
      timestamp: Date.now(),
      offer: data.offer
    });

    // Get caller info
    try {
      const { data: callerData } = await API.get(`/users/${data.from_user}/`);
      const caller = callerData;

      // Show incoming call modal immediately
      setIncomingOffer(data.offer);
      setRemoteUser(caller);

      // Add notification
      addNotification({
        type: 'call',
        senderId: data.from_user,
        callId: callId,
        title: `Incoming call from ${caller.username || 'User'}`,
        message: 'Incoming call...',
        onClick: () => {
          // Keep the modal open
          setIncomingOffer(data.offer);
          setRemoteUser(caller);
        }
      });
    } catch (err) {
      console.error('Error fetching caller info:', err);
    }
  };

  // Handle call ended
  const handleCallEnded = (data) => {
    const callId = `${data.from_user}_${data.offer?.sdp || Date.now()}`;
    if (activeCallIds.current.has(callId)) {
      cleanupCall();
      activeCallIds.current.delete(callId);
      pendingCalls.current.delete(callId);
    }
  };

  // Cleanup call
  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setInCall(false);
    setRemoteUser(null);
    setIncomingOffer(null);
    setCallStatus(null);
  };

  // Create peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: 'ice',
          to_user: remoteUser.user_id,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // Start call
  const startCall = async (user) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraOn,
        audio: micOn
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      wsRef.current.send(JSON.stringify({
        action: 'call',
        to_user: user.user_id,
        offer: offer
      }));

      setRemoteUser(user);
      setCallStatus('calling');
    } catch (err) {
      console.error('Error starting call:', err);
      cleanupCall();
    }
  };

  // Accept call
  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraOn,
        audio: micOn
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current.send(JSON.stringify({
        action: 'answer',
        to_user: remoteUser.user_id,
        answer: answer
      }));

      setInCall(true);
      setCallStatus('connected');
      setIncomingOffer(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      cleanupCall();
    }
  };

  // Decline call
  const declineCall = () => {
    if (remoteUser && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'decline',
        to_user: remoteUser.user_id
      }));
    }
    cleanupCall();
  };

  // End call
  const endCall = () => {
    if (remoteUser && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'hangup',
        to_user: remoteUser.user_id
      }));
    }
    cleanupCall();
  };

  // Toggle mic
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const value = {
    inCall,
    remoteUser,
    incomingOffer,
    localStream,
    micOn,
    cameraOn,
    callStatus,
    localVideoRef,
    remoteVideoRef,
    connectWebSocket,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMic,
    toggleCamera
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}; 