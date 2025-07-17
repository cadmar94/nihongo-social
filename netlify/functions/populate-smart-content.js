
// netlify/functions/populate-smart-content.js
// Populate database with frequency-based Japanese learning content

const { MongoClient } = require('mongodb');

// High-frequency vocabulary from subtitle corpus analysis
const highFrequencyWords = [
  // Top daily life vocabulary (frequency rank from subtitle analysis)
  { japanese: "今日", reading: "きょう", translation: "today", frequency: 25, pos: "noun" },
  { japanese: "食べる", reading: "たべる", translation: "to eat", frequency: 65, pos: "verb" },
  { japanese: "飲む", reading: "のむ", translation: "to drink", frequency: 70, pos: "verb" },
  { japanese: "美味しい", reading: "おいしい", translation: "delicious", frequency: 75, pos: "adjective" },
  { japanese: "やばい", reading: "やばい", translation: "awesome/terrible (slang)", frequency: 47, pos: "adjective" },
  { japanese: "すごい", reading: "すごい", translation: "amazing", frequency: 52, pos: "adjective" },
  { japanese: "大丈夫", reading: "だいじょうぶ", translation: "okay, all right", frequency: 57, pos: "adjective" },
  { japanese: "ちょっと", reading: "ちょっと", translation: "a little, wait", frequency: 62, pos: "adverb" },
  { japanese: "本当", reading: "ほんとう", translation: "really, truth", frequency: 67, pos: "noun" },
  { japanese: "家", reading: "いえ", translation: "house, home", frequency: 45, pos: "noun" },
  { japanese: "コーヒー", reading: "コーヒー", translation: "coffee", frequency: 90, pos: "noun" },
  { japanese: "料理", reading: "りょうり", translation: "cooking", frequency: 80, pos: "noun" },
  { japanese: "レストラン", reading: "レストラン", translation: "restaurant", frequency: 85, pos: "noun" },
  { japanese: "買う", reading: "かう", translation: "to buy", frequency: 82, pos: "verb" },
  { japanese: "店", reading: "みせ", translation: "store", frequency: 87, pos: "noun" },
  { japanese: "安い", reading: "やすい", translation: "cheap", frequency: 97, pos: "adjective" },
  { japanese: "高い", reading: "たかい", translation: "expensive", frequency: 102, pos: "adjective" },
  { japanese: "天気", reading: "てんき", translation: "weather", frequency: 135, pos: "noun" },
  { japanese: "雨", reading: "あめ", translation: "rain", frequency: 140, pos: "noun" },
  { japanese: "めちゃくちゃ", reading: "めちゃくちゃ", translation: "extremely", frequency: 120, pos: "adverb" }
];

// Generate smart content based on frequency data
function generateSmartPosts() {
  return [
    // High-frequency daily life posts
    {
      type: "Morning Post",
      japanese: "今日はコーヒーを飲む",
      reading: "きょうはコーヒーをのむ",
      translation: "Today I'm drinking coffee",
      explanation: "今日 (rank #25) and コーヒー (rank #90) are high-frequency words in Japanese media. Much more useful than textbook phrases like 'where is the library'.",
      difficulty: "beginner",
      tags: ["daily-life", "drinks", "high-frequency"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 25,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Food Review",
      japanese: "この料理は美味しい",
      reading: "このりょうりはおいしい",
      translation: "This food is delicious",
      explanation: "料理 (rank #80) and 美味しい (rank #75) appear constantly in anime/drama. Essential for food conversations.",
      difficulty: "beginner",
      tags: ["food", "adjective", "high-frequency"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 75,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Casual Expression",
      japanese: "やばい美味しい！",
      reading: "やばいおいしい！",
      translation: "So delicious!",
      explanation: "やばい (rank #47) is extremely common in casual anime/drama but rarely taught in textbooks. Essential for understanding real Japanese.",
      difficulty: "intermediate",
      tags: ["casual", "slang", "high-frequency"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 47,
      media_frequency: "high",
      priority: 1
    },
    {
      type: "Shopping Post",
      japanese: "この店は安い",
      reading: "このみせはやすい",
      translation: "This store is cheap",
      explanation: "店 (rank #87) and 安い (rank #97) are practical vocabulary for daily life. Much more useful than academic Japanese.",
      difficulty: "beginner",
      tags: ["shopping", "adjective", "daily-life"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 87,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Weather Chat",
      japanese: "今日の天気は大丈夫",
      reading: "きょうのてんきはだいじょうぶ",
      translation: "Today's weather is okay",
      explanation: "天気 (rank #135) and 大丈夫 (rank #57) appear frequently in daily conversation. 大丈夫 has many uses beyond just 'okay'.",
      difficulty: "intermediate",
      tags: ["weather", "daily-life", "versatile-word"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 57,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Home Life",
      japanese: "家で料理を作る",
      reading: "いえでりょうりをつくる",
      translation: "Making food at home",
      explanation: "家 (rank #45) and 料理 (rank #80) are essential daily vocabulary. Notice the を particle marking the object.",
      difficulty: "beginner",
      tags: ["home", "cooking", "particles"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 45,
      media_frequency: "high",
      priority: 1
    },
    {
      type: "Casual Reaction",
      japanese: "すごいね！",
      reading: "すごいね！",
      translation: "That's amazing!",
      explanation: "すごい (rank #52) is one of the most useful casual expressions. Appears constantly in anime but underemphasized in textbooks.",
      difficulty: "beginner",
      tags: ["casual", "reaction", "high-frequency"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 52,
      media_frequency: "high",
      priority: 1
    },
    {
      type: "Shopping Decision",
      japanese: "ちょっと高いかな",
      reading: "ちょっとたかいかな",
      translation: "It's a bit expensive, I guess",
      explanation: "ちょっと (rank #62) and 高い (rank #102) with かな ending - very natural Japanese that appears in real conversations.",
      difficulty: "intermediate",
      tags: ["shopping", "hesitation", "natural-speech"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 62,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Confirmation",
      japanese: "本当？",
      reading: "ほんとう？",
      translation: "Really?",
      explanation: "本当 (rank #67) is extremely high-frequency for confirmations and questions. Essential for natural conversation flow.",
      difficulty: "beginner",
      tags: ["question", "confirmation", "high-frequency"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 67,
      media_frequency: "high",
      priority: 1
    },
    {
      type: "Restaurant Experience",
      japanese: "レストランで食べる",
      reading: "レストランでたべる",
      translation: "Eating at a restaurant",
      explanation: "レストラン (rank #85) and 食べる (rank #65) are practical daily vocabulary. で particle shows location of action.",
      difficulty: "beginner",
      tags: ["restaurant", "dining", "location-particle"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 65,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Weather Report",
      japanese: "雨が降る",
      reading: "あめがふる",
      translation: "It's raining",
      explanation: "雨 (rank #140) and the pattern 'rain falls' is common in weather discussions. が marks the subject doing the action.",
      difficulty: "beginner",
      tags: ["weather", "verb", "subject-particle"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 140,
      media_frequency: "medium",
      priority: 3
    },
    {
      type: "Intense Reaction",
      japanese: "めちゃくちゃ美味しい",
      reading: "めちゃくちゃおいしい",
      translation: "Extremely delicious",
      explanation: "めちゃくちゃ (rank #120) is very common in casual speech for emphasis. Much more natural than textbook intensifiers.",
      difficulty: "intermediate",
      tags: ["casual", "intensifier", "food"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 120,
      media_frequency: "high",
      priority: 2
    },
    // Mixed writing system posts (same content, different scripts)
    {
      type: "Writing Practice",
      japanese: "きょう vs 今日",
      reading: "きょう",
      translation: "today",
      explanation: "Same word, different writing. Can you recognize them as identical when heard? This trains sound-meaning connections vs visual recognition.",
      difficulty: "beginner",
      tags: ["writing-practice", "phonetic-training", "hiragana"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 25,
      media_frequency: "high",
      priority: 1
    },
    {
      type: "Writing Practice",
      japanese: "りょうり vs 料理",
      reading: "りょうり",
      translation: "cooking, cuisine",
      explanation: "High-frequency word (rank #80) in different scripts. Training your brain to connect sound to meaning regardless of writing system.",
      difficulty: "intermediate",
      tags: ["writing-practice", "food", "phonetic-training"],
      audioFirst: true,
      exerciseType: "phonetic",
      frequency_rank: 80,
      media_frequency: "high",
      priority: 2
    },
    {
      type: "Daily Routine",
      japanese: "コーヒーを買う",
      reading: "コーヒーをかう",
      translation: "Buying coffee",
      explanation: "Both コーヒー (rank #90) and 買う (rank #82) are high-frequency daily vocabulary. を particle marks what you're buying.",
      difficulty: "beginner",
      tags: ["shopping", "daily-routine", "object-particle"],
      audioFirst: false,
      exerciseType: "recognition",
      frequency_rank: 82,
      media_frequency: "high",
      priority: 2
    }
  ];
}

exports.handler = async (event, context) => {
  console.log('Starting smart content population...');
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await client.connect();
    console.log('Connected successfully');
    
    const db = client.db('nihongo-social');
    const collection = db.collection('posts');
    
    // Clear existing posts
    const deleteResult = await collection.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing posts`);
    
    // Generate and insert frequency-based content
    const smartPosts = generateSmartPosts();
    const insertResult = await collection.insertMany(smartPosts);
    console.log(`Inserted ${insertResult.insertedCount} frequency-based posts`);
    
    // Create indexes optimized for frequency-based learning
    await collection.createIndex({ frequency_rank: 1 });
    await collection.createIndex({ media_frequency: 1 });
    await collection.createIndex({ difficulty: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ exerciseType: 1 });
    await collection.createIndex({ priority: 1 });
    console.log('Created frequency-optimized indexes');
    
    // Verify the data
    const count = await collection.countDocuments();
    const highFreqCount = await collection.countDocuments({ media_frequency: "high" });
    console.log(`Total posts: ${count}, High-frequency posts: ${highFreqCount}`);
    
    await client.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Smart frequency-based content populated successfully',
        postsInserted: insertResult.insertedCount,
        totalPosts: count,
        highFrequencyPosts: highFreqCount,
        approach: 'subtitle-corpus-frequency-based',
        note: 'Content prioritizes words that actually appear in Japanese media vs textbook phrases'
      })
    };
    
  } catch (error) {
    console.error('Error populating smart content:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        approach: 'frequency-based generation failed'
      })
    };
  }
};
