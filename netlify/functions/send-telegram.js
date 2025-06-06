exports.handler = async (event, context) => {
  // DEBUG: Log what we're receiving
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
    const requestData = JSON.parse(event.body);
    
    // Support both single chat ID (old format) and multiple chat IDs (new format)
    let chatIds = [];
    if (requestData.chatId) {
      // Old format: single chatId
      chatIds = [requestData.chatId];
    } else if (requestData.chatIds && Array.isArray(requestData.chatIds)) {
      // New format: array of chatIds
      chatIds = requestData.chatIds;
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Missing chatId or chatIds field',
          hint: 'Use either "chatId": "123456" or "chatIds": ["123456", "789012"]'
        })
      };
    }

    const { botToken, message } = requestData;

    if (!botToken || !message || chatIds.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: botToken, message, and chatId(s)' 
        })
      };
    }

    console.log(`Sending message to ${chatIds.length} recipients:`, chatIds);
    
    // Send message to all chat IDs
    const results = [];
    const telegramBaseUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    for (let i = 0; i < chatIds.length; i++) {
      const chatId = chatIds[i];
      console.log(`Sending to recipient ${i + 1}/${chatIds.length}: ${chatId}`);
      
      try {
        const response = await fetch(telegramBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: chatId, 
            text: `${message}\n\n🤖 Sent to ${chatIds.length} recipient(s)` 
          })
        });

        const result = await response.json();
        
        results.push({
          chatId: chatId,
          success: response.ok,
          status: response.status,
          response: result
        });
        
        if (response.ok) {
          console.log(`✅ Success for ${chatId}:`, result);
        } else {
          console.log(`❌ Failed for ${chatId}:`, result);
        }
        
      } catch (error) {
        console.log(`💥 Error for ${chatId}:`, error.message);
        results.push({
          chatId: chatId,
          success: false,
          error: error.message
        });
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < chatIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Summary: ${successful} successful, ${failed} failed`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        summary: {
          total: chatIds.length,
          successful: successful,
          failed: failed
        },
        results: results
      })
    };

  } catch (error) {
    console.log('💥 Function error:', error);
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
