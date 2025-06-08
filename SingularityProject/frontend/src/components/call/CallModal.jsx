import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPhone, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaTimes } from 'react-icons/fa';
import { useCall } from '../../contexts/CallContext';

const CallModal = () => {
  const {
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
    acceptCall,
    declineCall,
    endCall,
    toggleMic,
    toggleCamera
  } = useCall();

  // Connect WebSocket when component mounts
  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  // If there's no active call or incoming call, don't render anything
  if (!inCall && !incomingOffer) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        {/* Close button (only show when in call) */}
        {inCall && (
          <button
            onClick={endCall}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        )}

        {/* Call status */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {inCall ? 'In Call' : (incomingOffer ? 'Incoming Call' : 'Calling...')}
          </h2>
          <p className="text-gray-600">
            {remoteUser?.username || 'User'}
            {!inCall && !incomingOffer && callStatus === 'calling' && ' (Waiting for answer...)'}
            {incomingOffer && !inCall && ' (Ringing...)'}
          </p>
        </div>

        {/* Video containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Remote video */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden md:col-span-1">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {remoteUser?.username || 'User'}
              </div>
            )}
          </div>

          {/* Local video */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden md:col-span-1">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!localVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium">
                You
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className="flex justify-center space-x-4">
          {inCall ? (
            <>
              {/* In-call controls */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full transition-colors duration-200 ${
                  micOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {micOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition-colors duration-200 ${
                  cameraOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {cameraOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
              </button>
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <FaPhone size={20} className="rotate-135" />
                <span className="ml-2">End Call</span>
              </button>
            </>
          ) : (
            <>
              {/* Incoming call controls / Outgoing call controls */}
              <button
                onClick={declineCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <FaPhone size={20} className="rotate-135" />
              </button>
              {incomingOffer && ( // Only show accept button if there's an incoming offer
                <button
                  onClick={acceptCall}
                  className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <FaPhone size={20} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the root level
  return createPortal(modalContent, document.body);
};

export default CallModal; 