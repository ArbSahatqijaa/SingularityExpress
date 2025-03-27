import React, { useEffect, useState } from 'react';
import API from '../services/api';

function ExamplePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get('/example/')
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h1>Example Items</h1>
      {items.map(item => (
        <p key={item.id}>{item.name}</p>
      ))}
    </div>
  );
}

export default ExamplePage;
