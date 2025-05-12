# SingularityExpress Video Calling Feature Setup Guide

This guide provides step-by-step instructions for setting up and using the WebRTC video calling feature in the SingularityExpress platform.

## Overview

The video calling feature allows users to:
- Make peer-to-peer video calls to other users
- Accept/decline incoming calls
- Control microphone (mute/unmute)
- Toggle camera on/off
- Share screen during calls
- Call history is stored in MongoDB

## Prerequisites

- Python 3.10+ 
- Node.js 16+ and npm
- MongoDB (running locally or accessible)
- MySQL database (for user authentication)

## Backend Setup

### 1. Install Python Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd SingularityProject/backend
pip install -r requirements.txt
```

If you're missing any of these packages, install them manually:

```bash
pip install channels==4.1.0 channels_redis==4.2.0 Django==5.1.7 djangorestframework==3.15.2 
pip install djangorestframework-simplejwt==5.3.1 django-cors-headers==4.7.0 asgiref==3.8.1
pip install mysqlclient==2.2.7 pymongo==4.11.3 daphne>=4,<5
```

### 2. Configure MongoDB

1. Ensure MongoDB is running on localhost:27017
2. No authentication is required by default (will try without auth first)
3. The application will automatically create the database and collections

Verify MongoDB settings in `SingularityProject/backend/core/settings.py`:

```python
MONGO_CONFIG = {
    'DB_NAME': 'singularityexpressCommunication',
    'HOST': 'localhost',
    'PORT': 27017,
    'USERNAME': 'mongouser',  # Optional, used as fallback
    'PASSWORD': 'ubtubt123'   # Optional, used as fallback
}
```

### 3. Running the Backend Server

**IMPORTANT**: The video calling feature requires an ASGI server (Daphne). Standard Django runserver will not work for WebSockets.

Start the server using:

```bash
cd SingularityProject/backend
python -m daphne -p 8000 core.asgi:application
```

If port 8000 is in use, you can use a different port:

```bash
python -m daphne -p 8001 core.asgi:application
```

You should see output like:
```
INFO Starting server at tcp:port=8000:interface=127.0.0.1
INFO HTTP/2 support not enabled (install the http2 and tls Twisted extras)
INFO Configuring endpoint tcp:port=8000:interface=127.0.0.1
INFO Listening on TCP address 127.0.0.1:8000
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd SingularityProject/frontend
npm install
```

### 2. Configure API Endpoint

Make sure the frontend is configured to connect to your backend API:

- Check `src/services/api.js` to ensure it's pointing to the correct backend URL
- If you changed the backend port, update the WebSocket URL in `src/pages/CommunicationHub.jsx`

### 3. Start the Frontend

```bash
cd SingularityProject/frontend
npm start
```

This will start the React development server on port 3000.

## Using the Video Call Feature

1. **Log in with two different accounts**:
   - Open two browser windows/tabs
   - Log in with different accounts in each

2. **Make a call**:
   - In the first browser, navigate to the Communication Hub
   - Click on the user you want to call
   - Click the "Call" button

3. **Answer a call**:
   - In the second browser, you will see an incoming call notification
   - Click "Accept" to join the call or "Decline" to reject it

4. **During the call**:
   - Use the buttons to mute/unmute your microphone
   - Turn your camera on/off
   - Share your screen
   - Click "End Call" to hang up

## Troubleshooting

### WebSocket Connection Issues

If you see "WebSocket connection failed" errors in the console:

1. **Ensure Daphne is running correctly**:
   - Check that you're using `python -m daphne -p 8000 core.asgi:application`
   - NOT using the regular Django runserver

2. **Check for port conflicts**:
   - If port 8000 is already in use, choose another port
   - Update the WebSocket URL in the frontend code accordingly

3. **Verify CORS settings**:
   - Ensure your frontend origin is listed in `CORS_ALLOWED_ORIGINS` in settings.py

### MongoDB Connection Issues

If call recordings aren't being saved:

1. **Check MongoDB is running**:
   ```bash
   mongosh --eval "db.runCommand({ping:1})"
   ```

2. **Verify the database connection in logs**:
   - Look for "MongoDB connection successful" messages
   - If using authentication, check credentials in settings.py

### User Registration Issues

If user registration fails with 400 Bad Request:

1. Ensure all required fields are provided:
   - username
   - first_name
   - last_name
   - email
   - password

2. Check for duplicate usernames or emails

### Video/Audio Issues

1. **Browser Permissions**:
   - Ensure the browser has permission to access camera and microphone
   - Look for the camera icon in the address bar to check permissions

2. **Hardware Issues**:
   - Verify the camera and microphone are working in other applications
   - Try using external devices if built-in ones aren't working

## Architecture Notes

The video calling feature uses:

- **WebRTC** for peer-to-peer media connections
- **Django Channels** for WebSocket signaling
- **MongoDB** for call history storage
- **JWT authentication** for secure WebSocket connections

Call signaling flow:
1. Caller sends offer to server via WebSocket
2. Server forwards offer to callee as "incoming_call"
3. Callee sends answer back via server
4. ICE candidates are exchanged for NAT traversal
5. Direct peer connection is established for audio/video 