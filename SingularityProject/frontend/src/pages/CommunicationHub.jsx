import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);

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
    const ws = new WebSocket(`ws://localhost:8000/ws/communication/?token=${token}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('📡 WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WS message', data);
      if (data.action === 'incoming_call') {
        setIncomingOffer(data.offer);
        setRemoteUser(data.from_user);
      } else if (data.action === 'call_answered') {
        pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.action === 'ice') {
        if (pcRef.current) {
          pcRef.current.addIceCandidate(data.candidate);
        }
      } else if (data.action === 'hangup') {
        if (pcRef.current) pcRef.current.close();
        pcRef.current = null;
        setInCall(false);
      } else if (data.action === 'user_created' || data.action === 'user_updated') {
        addOrUpdateUser(data.user);
      }
    };
    return () => ws.close();
  }, []);

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
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });
    pc.onicecandidate = (e) => {
      if (e.candidate && remoteUser) {
        wsRef.current?.send(JSON.stringify({
          action: 'ice',
          target: remoteUser,
          candidate: e.candidate,
        }));
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    return pc;
  };

  const startCall = async (userId) => {
    setRemoteUser(userId);
    pcRef.current = createPeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    wsRef.current?.send(JSON.stringify({
      action: 'call',
      target: userId,
      offer,
    }));
    setInCall(true);
  };

  const acceptCall = async () => {
    if (!incomingOffer) return;
    pcRef.current = createPeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    await pcRef.current.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    wsRef.current?.send(JSON.stringify({
      action: 'answer',
      target: remoteUser,
      answer,
    }));
    setInCall(true);
    setIncomingOffer(null);
  };

  const declineCall = () => {
    if (remoteUser) {
      wsRef.current?.send(JSON.stringify({
        action: 'hangup',
        target: remoteUser,
      }));
    }
    setIncomingOffer(null);
  };

  const endCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setInCall(false);
    setRemoteUser(null);
    setLocalStream(null);
    setSharingScreen(false);

    if (remoteUser) {
      wsRef.current?.send(JSON.stringify({
        action: 'hangup',
        target: remoteUser,
      }));
    }
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

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Communication Hub</h1>
      {incomingOffer && !inCall && (
        <div className="mb-4 bg-blue-100 p-4 rounded">
          <p>{`Incoming call from user ${remoteUser}`}</p>
          <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 mr-2 rounded">Accept</button>
          <button onClick={declineCall} className="bg-red-500 text-white px-4 py-2 rounded">Decline</button>
        </div>
      )}

      {!inCall ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.user_id !== currentUser).map((user) => (
            <div key={user.user_id} className="border p-4 rounded shadow">
              <p className="font-semibold">{user.username}</p>
              <button
                onClick={() => startCall(user.user_id)}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Call
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex gap-4 mb-4">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-48 h-36 bg-black" />
            <video ref={remoteVideoRef} autoPlay playsInline className="w-48 h-36 bg-black" />
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={toggleMic} className="bg-gray-700 text-white px-4 py-2 rounded">
              {micOn ? 'Mute' : 'Unmute'}
            </button>
            <button onClick={toggleCamera} className="bg-gray-700 text-white px-4 py-2 rounded">
              {cameraOn ? 'Camera Off' : 'Camera On'}
            </button>
            <button onClick={toggleScreenShare} className="bg-gray-700 text-white px-4 py-2 rounded">
              {sharingScreen ? 'Stop Share' : 'Share Screen'}
            </button>
          </div>
          <button onClick={endCall} className="bg-red-500 text-white px-6 py-2 rounded">End Call</button>
        </div>
      )}
    </div>
  );
} 