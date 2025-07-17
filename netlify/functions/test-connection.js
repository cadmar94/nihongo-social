exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Test function works',
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        mongodb_uri_length: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
