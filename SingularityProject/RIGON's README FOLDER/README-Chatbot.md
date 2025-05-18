# SingularityExpress Chatbot (AI Chat) Implementation Guide

This document explains the implementation details of the Chatbot (AI Chat) feature in SingularityExpress, including both backend and frontend components.

## Backend Implementation

### Core Files

1. **`api/views/ai_chat.py`**
   - Contains two main API endpoints:
     ```python
     @api_view(['GET'])
     def test_mongodb_connection(request):
         # Tests MongoDB connection by inserting/deleting a test document
         # Uses request.user.user_id for authentication
     ```
     ```python
     @api_view(['POST'])
     def get_ai_response(request):
         # Main endpoint for chat functionality
         # Handles:
         # - User authentication (JWT)
         # - Message processing
         # - MongoDB logging
         # - Optional AI response generation
     ```
   - Key features:
     - JWT authentication using `IsAuthenticated` permission
     - Uses `request.user.user_id` (not `id`) for user identification
     - Stores conversations in MongoDB collection `ai_questions_and_answers`
     - Supports external AI APIs (OpenRouter/OpenAI) for response generation

2. **`utils/mongodb_schemas.py`**
   - Defines MongoDB collection schemas and indexes
   - Key collections:
     ```python
     # AI Chat collection schema
     {
         'validator': {
             '$jsonSchema': {
                 'required': ['user_id', 'message', 'timestamp'],
                 'properties': {
                     'user_id': {'bsonType': 'string'},
                     'message': {'bsonType': 'string'},
                     'answer': {'bsonType': 'string'},
                     'conversation_history': {'bsonType': 'array'},
                     'timestamp': {'bsonType': 'date'}
                 }
             }
         }
     }
     ```
   - Creates unique indexes for message tracking
   - Handles collection creation and validation

3. **`utils/fix_mongodb_indexes.py`**
   - Utility script for managing MongoDB indexes
   - Functions:
     ```python
     def fix_message_indexes():
         # Drops problematic indexes
         # Cleans up documents with null message_id
         # Recreates indexes with proper constraints
     ```
   - Used to resolve duplicate key errors and index issues

4. **`core/settings.py`**
   - Contains MongoDB configuration:
     ```python
     MONGO_CONFIG = {
         'DB_NAME': 'singularityexpressCommunication',
         'HOST': 'localhost',
         'PORT': 27017,
         'USERNAME': 'mongouser',  # Optional
         'PASSWORD': 'ubtubt123'   # Optional
     }
     ```
   - JWT authentication settings
   - CORS configuration for frontend access

### Database Schema

1. **MongoDB Collections**

   a. `ai_questions_and_answers`:
   ```javascript
   {
     user_id: String,          // User identifier
     message: String,          // User's message
     answer: String,           // AI's response
     conversation_history: [   // Array of previous messages
       {
         role: String,         // 'user' or 'assistant'
         content: String       // Message content
       }
     ],
     timestamp: Date,          // When the message was sent
     model_used: String        // Optional: AI model identifier
   }
   ```

   b. `messages` (if used):
   ```javascript
   {
     message_id: String,       // Unique identifier
     user_id: String,          // User identifier
     content: String,          // Message content
     timestamp: Date           // When the message was sent
   }
   ```

## Frontend Implementation

### Core Files

1. **`src/pages/ChatAssistant.jsx`**
   - Main React component for the chat interface
   - Features:
     - Real-time message display
     - Message input handling
     - Conversation history management
     - Error handling and retry logic
   - Key functions:
     ```javascript
     const sendMessage = async (message) => {
       // Sends message to backend
       // Handles response
       // Updates conversation history
     }
     ```
     ```javascript
     const handleRetry = async () => {
       // Implements retry logic for failed requests
       // Uses exponential backoff
     }
     ```

2. **`src/services/api.js`**
   - API service configuration
   - JWT token management
   - API endpoint definitions:
     ```javascript
     const API_ENDPOINTS = {
       CHAT: '/api/ai/chat/',
       TEST_MONGODB: '/api/ai/test_mongodb_connection/'
     }
     ```
   - Axios instance configuration with:
     - Base URL
     - JWT token injection
     - Error handling
     - Request/response interceptors

3. **`src/components/ChatMessage.jsx`**
   - Reusable component for displaying messages
   - Props:
     ```javascript
     {
       message: String,        // Message content
       isUser: Boolean,        // Whether message is from user
       timestamp: Date,        // When message was sent
       error: Boolean          // Whether message had an error
     }
     ```
   - Handles message styling and error states

### State Management

1. **Conversation State**
   ```javascript
   const [messages, setMessages] = useState([])
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
   const [retryCount, setRetryCount] = useState(0)
   ```

2. **Authentication State**
   - Managed through JWT tokens
   - Stored in localStorage
   - Automatically injected into API requests

## API Endpoints

1. **POST `/api/ai/chat/`**
   - Request body:
     ```json
     {
       "message": "User's message",
       "conversation_history": [
         {
           "role": "user",
           "content": "Previous message"
         }
       ]
     }
     ```
   - Response:
     ```json
     {
       "status": "success",
       "data": {
         "answer": "AI's response",
         "conversation_history": [...]
       }
     }
     ```

2. **GET `/api/ai/test_mongodb_connection/`**
   - No request body required
   - Response:
     ```json
     {
       "status": "success",
       "message": "MongoDB connection successful"
     }
     ```

## Error Handling

1. **Backend Errors**
   - 401: Unauthorized (JWT token missing/invalid)
   - 500: Internal Server Error
     - MongoDB connection issues
     - User authentication problems
     - Index/duplicate key errors

2. **Frontend Error Handling**
   - Automatic retry logic for failed requests
   - User-friendly error messages
   - Error state management in UI
   - Console logging for debugging

## Security Considerations

1. **Authentication**
   - JWT-based authentication
   - Token stored in localStorage
   - Automatic token refresh
   - Protected API endpoints

2. **Data Validation**
   - MongoDB schema validation
   - Input sanitization
   - Type checking
   - Required field validation

## Performance Optimizations

1. **Frontend**
   - Message pagination
   - Lazy loading of conversation history
   - Debounced message sending
   - Optimistic updates

2. **Backend**
   - MongoDB indexing
   - Connection pooling
   - Efficient query patterns
   - Proper error handling

## Development Notes

1. **Running the Application**
   - Backend: `python -m daphne -p 8000 core.asgi:application`
   - Frontend: `npm start`
   - MongoDB: Must be running on configured port

2. **Testing**
   - Backend: Django test framework
   - Frontend: Jest/React Testing Library
   - API: Postman/curl for endpoint testing

3. **Debugging**
   - Backend: Django debug mode
   - Frontend: React Developer Tools
   - MongoDB: MongoDB Compass
   - Network: Browser DevTools

## Common Issues and Solutions

1. **MongoDB Connection Issues**
   - Check MongoDB service status
   - Verify connection settings
   - Check network connectivity
   - Verify authentication credentials

2. **Authentication Problems**
   - Check JWT token validity
   - Verify token storage
   - Check CORS settings
   - Verify user permissions

3. **Message Processing Errors**
   - Check message format
   - Verify conversation history structure
   - Check MongoDB document validation
   - Verify user authentication

## Future Improvements

1. **Planned Features**
   - Message encryption
   - File attachments
   - Typing indicators
   - Message reactions

2. **Technical Improvements**
   - WebSocket support for real-time updates
   - Message queuing system
   - Advanced caching
   - Rate limiting

---

This implementation guide provides a technical overview of the Chatbot feature. For setup instructions, please refer to the setup guide. 