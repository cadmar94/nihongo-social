// netlify/functions/debug-database.js
// Debug function to check what's actually in the database

const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db('nihongo-social');
    const collection = db.collection('posts');
    
    // Get detailed info about the collection
    const totalCount = await collection.countDocuments();
    const allPosts = await collection.find({}).toArray();
    const firstPost = await collection.findOne({});
    const samplePosts = await collection.find({}).limit(3).toArray();
    
    await client.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        totalCount,
        actualPostsReturned: allPosts.length,
        firstPost,
        samplePosts,
        postTypes: allPosts.map(p => p.type)
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
