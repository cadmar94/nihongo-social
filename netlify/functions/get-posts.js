const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    // For now, return sample data
    const samplePosts = [
      {
        type: "Morning Post",
        japanese: "おはようございます！",
        reading: "",
        translation: "Good morning!",
        explanation: "The polite morning greeting. More formal than おはよう. Used until about 10 AM.",
        difficulty: "beginner"
      }
    ];

    await client.close();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(samplePosts)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
