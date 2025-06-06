exports.handler = async (event, context) => {
  // DEBUG: Log what we're actually receiving
  console.log('=== FUNCTION DEBUG ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  // Check for POST
  if (event.httpMethod !== 'POST') {
    console.log('Not a POST request. Method was:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Method not allowed',
        received_method: event.httpMethod
      })
    };
  }

  try {
    console.log('Processing POST request...');
    const { botToken, chatId, message } = JSON.parse(event.body);

    if (!botToken || !chatId || !message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    console.log('Sending to Telegram:', telegramUrl);
    
    // Use native fetch (available in Node.js 18+)
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    const result = await response.json();
    console.log('Telegram response:', result);

    return {
      statusCode: response.ok ? 200 : 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.log('Error in function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Server error', 
        details: error.message 
      })
    };
  }
};
