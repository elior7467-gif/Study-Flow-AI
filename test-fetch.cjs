const fetch = require('node-fetch'); // wait, fetch is global in Node 18+

async function test() {
  const response = await fetch('http://localhost:3000/api/chat-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'HEllo' }],
      chatId: undefined
    })
  });
  console.log('STATUS:', response.status);
  const text = await response.text();
  console.log('BODY:', text);
}

test();
