import { useState } from 'react';
import API from '../../services/api';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post('/chat/', {
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: message }]
});
    const data = res.data;
    setResponse(data.choices?.[0]?.message?.content || 'No response');
  } catch (error) {
    setResponse(`Error: ${error.message}`);
  }
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask something..." />
        <button type="submit">Send</button>
      </form>
      <div>
        <strong>Response:</strong> {response}
      </div>
    </div>
  );
}
