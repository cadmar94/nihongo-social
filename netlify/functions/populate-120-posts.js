// netlify/functions/populate-120-posts.js
// Generate 120 frequency-based Japanese learning posts including sumo content
// 50 daily life + 30 food + 20 casual + 20 sumo posts

const { MongoClient } = require('mongodb');

// High-frequency vocabulary from subtitle corpus analysis
const highFrequencyWords = [
  // Core basics (Top 20)
  { japanese: "の", reading: "の", translation: "of, 's (possessive)", frequency: 1, pos: "particle" },
  { japanese: "に", reading: "に", translation: "to, in, at", frequency: 2, pos: "particle" },
  { japanese: "は", reading: "は", translation: "topic marker", frequency: 3, pos: "particle" },
  { japanese: "を", reading: "を", translation: "object marker", frequency: 4, pos: "particle" },
  { japanese: "だ", reading: "だ", translation: "is/am/are (casual)", frequency: 5, pos: "auxiliary" },
  { japanese: "て", reading: "て", translation: "and (connecting)", frequency: 6, pos: "particle" },
  { japanese: "が", reading: "が", translation: "subject marker", frequency: 7, pos: "particle" },
  { japanese: "と", reading: "と", translation: "with, and", frequency: 8, pos: "particle" },
  { japanese: "で", reading: "で", translation: "at, by, with", frequency: 9, pos: "particle" },
  { japanese: "も", reading: "も", translation: "also, too", frequency: 10, pos: "particle" },

  // High-frequency verbs and adjectives (Daily Life)
  { japanese: "ある", reading: "ある", translation: "to exist (inanimate)", frequency: 11, pos: "verb" },
  { japanese: "いる", reading: "いる", translation: "to exist (animate)", frequency: 12, pos: "verb" },
  { japanese: "する", reading: "する", translation: "to do", frequency: 13, pos: "verb" },
  { japanese: "なる", reading: "なる", translation: "to become", frequency: 14, pos: "verb" },
  { japanese: "いい", reading: "いい", translation: "good", frequency: 15, pos: "adjective" },
  { japanese: "ない", reading: "ない", translation: "not", frequency: 16, pos: "auxiliary" },
  { japanese: "思う", reading: "おもう", translation: "to think", frequency: 17, pos: "verb" },
  { japanese: "言う", reading: "いう", translation: "to say", frequency: 18, pos: "verb" },
  { japanese: "見る", reading: "みる", translation: "to see, watch", frequency: 19, pos: "verb" },
  { japanese: "行く", reading: "いく", translation: "to go", frequency: 20, pos: "verb" },

  // Daily life essentials
  { japanese: "今日", reading: "きょう", translation: "today", frequency: 25, pos: "noun" },
  { japanese: "昨日", reading: "きのう", translation: "yesterday", frequency: 35, pos: "noun" },
  { japanese: "明日", reading: "あした", translation: "tomorrow", frequency: 40, pos: "noun" },
  { japanese: "時間", reading: "じかん", translation: "time", frequency: 30, pos: "noun" },
  { japanese: "家", reading: "いえ", translation: "house, home", frequency: 45, pos: "noun" },
  { japanese: "学校", reading: "がっこう", translation: "school", frequency: 50, pos: "noun" },
  { japanese: "仕事", reading: "しごと", translation: "work, job", frequency: 55, pos: "noun" },
  { japanese: "友達", reading: "ともだち", translation: "friend", frequency: 60, pos: "noun" },

  // Food culture high-frequency
  { japanese: "食べる", reading: "たべる", translation: "to eat", frequency: 65, pos: "verb" },
  { japanese: "飲む", reading: "のむ", translation: "to drink", frequency: 70, pos: "verb" },
  { japanese: "美味しい", reading: "おいしい", translation: "delicious", frequency: 75, pos: "adjective" },
  { japanese: "料理", reading: "りょうり", translation: "cooking, cuisine", frequency: 80, pos: "noun" },
  { japanese: "レストラン", reading: "レストラン", translation: "restaurant", frequency: 85, pos: "noun" },
  { japanese: "コーヒー", reading: "コーヒー", translation: "coffee", frequency: 90, pos: "noun" },
  { japanese: "お茶", reading: "おちゃ", translation: "tea", frequency: 95, pos: "noun" },
  { japanese: "ご飯", reading: "ごはん", translation: "rice, meal", frequency: 100, pos: "noun" },
  { japanese: "パン", reading: "パン", translation: "bread", frequency: 105, pos: "noun" },
  { japanese: "肉", reading: "にく", translation: "meat", frequency: 110, pos: "noun" },

  // Common casual expressions (anime/media frequent)
  { japanese: "やばい", reading: "やばい", translation: "awesome/terrible (slang)", frequency: 47, pos: "adjective" },
  { japanese: "すごい", reading: "すごい", translation: "amazing, incredible", frequency: 52, pos: "adjective" },
  { japanese: "大丈夫", reading: "だいじょうぶ", translation: "okay, all right", frequency: 57, pos: "adjective" },
  { japanese: "ちょっと", reading: "ちょっと", translation: "a little, wait", frequency: 62, pos: "adverb" },
  { japanese: "本当", reading: "ほんとう", translation: "really, truth", frequency: 67, pos: "noun" },
  { japanese: "多分", reading: "たぶん", translation: "probably, maybe", frequency: 72, pos: "adverb" },
  { japanese: "全然", reading: "ぜんぜん", translation: "not at all, totally", frequency: 77, pos: "adverb" },
  { japanese: "めちゃくちゃ", reading: "めちゃくちゃ", translation: "extremely, messy", frequency: 120, pos: "adverb" },

  // Shopping and daily errands
  { japanese: "買う", reading: "かう", translation: "to buy", frequency: 82, pos: "verb" },
  { japanese: "売る", reading: "うる", translation: "to sell", frequency: 125, pos: "verb" },
  { japanese: "店", reading: "みせ", translation: "store, shop", frequency: 87, pos: "noun" },
  { japanese: "お金", reading: "おかね", translation: "money", frequency: 92, pos: "noun" },
  { japanese: "安い", reading: "やすい", translation: "cheap", frequency: 97, pos: "adjective" },
  { japanese: "高い", reading: "たかい", translation: "expensive, tall", frequency: 102, pos: "adjective" },
  { japanese: "スーパー", reading: "スーパー", translation: "supermarket", frequency: 130, pos: "noun" },

  // Weather and environment
  { japanese: "天気", reading: "てんき", translation: "weather", frequency: 135, pos: "noun" },
  { japanese: "雨", reading: "あめ", translation: "rain", frequency: 140, pos: "noun" },
  { japanese: "暑い", reading: "あつい", translation: "hot", frequency: 145, pos: "adjective" },
  { japanese: "寒い", reading: "さむい", translation: "cold", frequency: 150, pos: "adjective" }
];

// Sumo-specific vocabulary
const sumoVocabulary = [
  // Core sumo terms
  { japanese: "相撲", reading: "すもう", translation: "sumo wrestling", frequency: 5, pos: "noun", category: "sport" },
  { japanese: "力士", reading: "りきし", translation: "sumo wrestler", frequency: 8, pos: "noun", category: "person" },
  { japanese: "土俵", reading: "どひょう", translation: "sumo ring", frequency: 12, pos: "noun", category: "place" },
  { japanese: "場所", reading: "ばしょ", translation: "tournament", frequency: 15, pos: "noun", category: "event" },
  { japanese: "勝負", reading: "しょうぶ", translation: "match, contest", frequency: 18, pos: "noun", category: "competition" },
  
  // Ranks
  { japanese: "横綱", reading: "よこづな", translation: "grand champion", frequency: 20, pos: "noun", category: "rank" },
  { japanese: "大関", reading: "おおぜき", translation: "champion rank", frequency: 25, pos: "noun", category: "rank" },
  { japanese: "関脇", reading: "せきわけ", translation: "junior champion", frequency: 30, pos: "noun", category: "rank" },
  { japanese: "小結", reading: "こむすび", translation: "senior wrestler", frequency: 35, pos: "noun", category: "rank" },
  { japanese: "前頭", reading: "まえがしら", translation: "rank and file wrestler", frequency: 40, pos: "noun", category: "rank" },
  
  // Equipment
  { japanese: "廻し", reading: "まわし", translation: "sumo belt", frequency: 22, pos: "noun", category: "equipment" },
  
  // Basic kimarite
  { japanese: "寄り切り", reading: "よりきり", translation: "frontal force out", frequency: 50, pos: "noun", category: "technique" },
  { japanese: "押し出し", reading: "おしだし", translation: "frontal push out", frequency: 55, pos: "noun", category: "technique" },
  { japanese: "叩き込み", reading: "はたきこみ", translation: "slap down", frequency: 65, pos: "noun", category: "technique" },
  { japanese: "上手投げ", reading: "うわてなげ", translation: "overarm throw", frequency: 75, pos: "noun", category: "technique" },
  
  // Tournament terms
  { japanese: "本場所", reading: "ほんばしょ", translation: "grand tournament", frequency: 60, pos: "noun", category: "event" },
  { japanese: "千秋楽", reading: "せんしゅうらく", translation: "final day", frequency: 95, pos: "noun", category: "event" },
  { japanese: "勝ち越し", reading: "かちこし", translation: "winning record", frequency: 67, pos: "noun", category: "result" },
  { japanese: "優勝", reading: "ゆうしょう", translation: "championship", frequency: 42, pos: "noun", category: "achievement" },
  { japanese: "金星", reading: "きんぼし", translation: "gold star (upset win)", frequency: 85, pos: "noun", category: "achievement" },
  
  // Ceremony
  { japanese: "土俵入り", reading: "どひょういり", translation: "ring entering ceremony", frequency: 90, pos: "noun", category: "ceremony" },
  { japanese: "立合い", reading: "たちあい", translation: "initial charge", frequency: 77, pos: "noun", category: "technique" }
];

// Generate 120 posts using all categories
function generate120Posts() {
  const allPosts = [
    ...generateDailyLifePosts(50),
    ...generateFoodPosts(30), 
    ...generateCasualPosts(20),
    ...generateSumoPosts(20)
  ];
  
  // Sort by frequency rank to prioritize most useful words
  allPosts.sort((a, b) => a.frequency_rank - b.frequency_rank);
  
  return allPosts;
}

// Daily life posts (50)
function generateDailyLifePosts(count) {
  const posts = [];
  const dailyLifeExamples = [
    { jp: "今日はコーヒーを飲む", read: "きょうはコーヒーをのむ", trans: "Today I'm drinking coffee", freq: 25 },
    { jp: "家で友達と会う", read: "いえでともだちとあう", trans: "Meeting friends at home", freq: 45 },
    { jp: "明日は仕事がある", read: "あしたはしごとがある", trans: "Tomorrow I have work", freq: 40 },
    { jp: "時間がない", read: "じかんがない", trans: "There's no time", freq: 30 },
    { jp: "学校に行く", read: "がっこうにいく", trans: "Going to school", freq: 50 },
    { jp: "昨日は暑かった", read: "きのうはあつかった", trans: "Yesterday was hot", freq: 35 },
    { jp: "お金を使う", read: "おかねをつかう", trans: "Using money", freq: 92 },
    { jp: "天気がいい", read: "てんきがいい", trans: "The weather is good", freq: 135 },
    { jp: "雨が降る", read: "あめがふる", trans: "It's raining", freq: 140 },
    { jp: "寒い日だ", read: "さむいひだ", trans: "It's a cold day", freq: 150 }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = dailyLifeExamples[i % dailyLifeExamples.length];
    const variation = i >= dailyLifeExamples.length ? ` (${Math.floor(i / dailyLifeExamples.length) + 1})` : '';
    
    posts.push({
      type: "Daily Life Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: `High-frequency daily vocabulary. Core words from subtitle analysis that appear in real conversations vs textbook phrases.`,
      difficulty: example.freq <= 50 ? "beginner" : "intermediate",
      tags: ["daily-life", "high-frequency", "practical"],
      audioFirst: Math.random() > 0.7,
      exerciseType: Math.random() > 0.5 ? "recognition" : "phonetic",
      frequency_rank: example.freq,
      media_frequency: "high",
      priority: Math.ceil(example.freq / 25)
    });
  }
  
  return posts;
}

// Food culture posts (30) 
function generateFoodPosts(count) {
  const posts = [];
  const foodExamples = [
    { jp: "この料理は美味しい", read: "このりょうりはおいしい", trans: "This food is delicious", freq: 75 },
    { jp: "レストランで食べる", read: "レストランでたべる", trans: "Eating at a restaurant", freq: 85 },
    { jp: "コーヒーを買う", read: "コーヒーをかう", trans: "Buying coffee", freq: 90 },
    { jp: "お茶を飲む", read: "おちゃをのむ", trans: "Drinking tea", freq: 95 },
    { jp: "ご飯を作る", read: "ごはんをつくる", trans: "Making rice/meal", freq: 100 },
    { jp: "パンが好き", read: "パンがすき", trans: "I like bread", freq: 105 },
    { jp: "肉を食べる", read: "にくをたべる", trans: "Eating meat", freq: 110 },
    { jp: "店で買い物", read: "みせでかいもの", trans: "Shopping at the store", freq: 87 },
    { jp: "安いレストラン", read: "やすいレストラン", trans: "Cheap restaurant", freq: 97 },
    { jp: "高い料理", read: "たかいりょうり", trans: "Expensive food", freq: 102 }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = foodExamples[i % foodExamples.length];
    const variation = i >= foodExamples.length ? ` (${Math.floor(i / foodExamples.length) + 1})` : '';
    
    posts.push({
      type: "Food Culture Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: `Food vocabulary from subtitle analysis. Essential for dining conversations and food anime/drama.`,
      difficulty: example.freq <= 100 ? "beginner" : "intermediate", 
      tags: ["food", "dining", "practical"],
      audioFirst: Math.random() > 0.6,
      exerciseType: Math.random() > 0.5 ? "recognition" : "phonetic",
      frequency_rank: example.freq,
      media_frequency: "high",
      priority: Math.ceil(example.freq / 30)
    });
  }
  
  return posts;
}

// Casual expressions (20)
function generateCasualPosts(count) {
  const posts = [];
  const casualExamples = [
    { jp: "やばい美味しい！", read: "やばいおいしい！", trans: "So delicious!", freq: 47 },
    { jp: "すごいね！", read: "すごいね！", trans: "That's amazing!", freq: 52 },
    { jp: "大丈夫？", read: "だいじょうぶ？", trans: "Are you okay?", freq: 57 },
    { jp: "ちょっと待って", read: "ちょっとまって", trans: "Wait a little", freq: 62 },
    { jp: "本当にすごい", read: "ほんとうにすごい", trans: "Really amazing", freq: 67 },
    { jp: "多分大丈夫", read: "たぶんだいじょうぶ", trans: "Probably okay", freq: 72 },
    { jp: "全然わからない", read: "ぜんぜんわからない", trans: "Don't understand at all", freq: 77 },
    { jp: "めちゃくちゃ面白い", read: "めちゃくちゃおもしろい", trans: "Extremely interesting", freq: 120 },
    { jp: "やばいって！", read: "やばいって！", trans: "No way!", freq: 47 },
    { jp: "すごく好き", read: "すごくすき", trans: "Really like it", freq: 52 }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = casualExamples[i % casualExamples.length];
    const variation = i >= casualExamples.length ? ` (${Math.floor(i / casualExamples.length) + 1})` : '';
    
    posts.push({
      type: "Casual Expression",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: `Casual anime/media expressions (rank #${example.freq}). Essential for understanding real Japanese but rarely taught in textbooks.`,
      difficulty: "intermediate",
      tags: ["casual", "anime", "slang", "high-frequency"],
      audioFirst: true, // Audio-first for casual speech patterns
      exerciseType: "phonetic",
      frequency_rank: example.freq,
      media_frequency: "high",
      priority: 1 // High priority for casual expressions
    });
  }
  
  return posts;
}

// Sumo posts (20)
function generateSumoPosts(count) {
  const posts = [];
  const sumoExamples = [
    { jp: "今日の相撲は面白い", read: "きょうのすもうはおもしろい", trans: "Today's sumo is interesting", freq: 5 },
    { jp: "横綱の寄り切りが美しい", read: "よこづなのよりきりがうつくしい", trans: "The yokozuna's yorikiri is beautiful", freq: 20 },
    { jp: "この力士はすごい", read: "このりきしはすごい", trans: "This wrestler is amazing", freq: 8 },
    { jp: "場所の千秋楽を見る", read: "ばしょのせんしゅうらくをみる", trans: "Watching the final day of the tournament", freq: 15 },
    { jp: "土俵入りは伝統的だ", read: "どひょういりはでんとうてきだ", trans: "The ring entering ceremony is traditional", freq: 90 },
    { jp: "金星を取った！", read: "きんぼしをとった！", trans: "Got a gold star!", freq: 85 },
    { jp: "押し出しで勝利", read: "おしだしでしょうり", trans: "Victory by push out", freq: 55 },
    { jp: "上手投げは難しい", read: "うわてなげはむずかしい", trans: "Overarm throw is difficult", freq: 75 },
    { jp: "本場所が始まった", read: "ほんばしょがはじまった", trans: "The grand tournament has begun", freq: 60 },
    { jp: "勝ち越しおめでとう", read: "かちこしおめでとう", trans: "Congratulations on your winning record", freq: 67 },
    { jp: "立合いが重要だ", read: "たちあいがじゅうようだ", trans: "The initial charge is important", freq: 77 },
    { jp: "廻しを掴む", read: "まわしをつかむ", trans: "Grabbing the mawashi", freq: 22 },
    { jp: "大関の相撲", read: "おおぜきのすもう", trans: "The ozeki's sumo", freq: 25 },
    { jp: "叩き込みで決まった", read: "はたきこみできまった", trans: "Decided by slap down", freq: 65 },
    { jp: "土俵の外に出る", read: "どひょうのそとにでる", trans: "Going outside the ring", freq: 12 },
    { jp: "優勝争いが激しい", read: "ゆうしょうあらそいがはげしい", trans: "The championship race is intense", freq: 42 },
    { jp: "関脇の頑張り", read: "せきわけのがんばり", trans: "The sekiwake's effort", freq: 30 },
    { jp: "小結も強い", read: "こむすびもつよい", trans: "The komusubi is also strong", freq: 35 },
    { jp: "前頭の活躍", read: "まえがしらのかつやく", trans: "The maegashira's performance", freq: 40 },
    { jp: "勝負の行方", read: "しょうぶのゆくえ", trans: "The outcome of the match", freq: 18 }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = sumoExamples[i % sumoExamples.length];
    
    posts.push({
      type: "Sumo Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans,
      explanation: `Sumo vocabulary essential for sumo anime/content. ${example.jp.split('の')[0] || example.jp.split('は')[0] || example.jp.split('を')[0]} is core sumo terminology used in commentary.`,
      difficulty: example.freq <= 50 ? "intermediate" : "advanced",
      tags: ["sumo", "sports", "traditional", "anime"],
      audioFirst: Math.random() > 0.5,
      exerciseType: Math.random() > 0.5 ? "recognition" : "phonetic",
      frequency_rank: example.freq,
      media_frequency: "high", // Sumo content is media-specific
      priority: example.freq <= 30 ? 1 : 2,
      sumo_category: "technique"
    });
  }
  
  return posts;
}

exports.handler = async (event, context) => {
  console.log('Starting 120-post content generation...');
  
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
    
    // Generate 120 posts: 50 daily + 30 food + 20 casual + 20 sumo
    const allPosts = generate120Posts();
    console.log(`Generated ${allPosts.length} total posts`);
    console.log(`Breakdown: ${allPosts.filter(p => p.type.includes('Daily')).length} daily life, ${allPosts.filter(p => p.type.includes('Food')).length} food, ${allPosts.filter(p => p.type.includes('Casual')).length} casual, ${allPosts.filter(p => p.type.includes('Sumo')).length} sumo`);
    
    const insertResult = await collection.insertMany(allPosts);
    console.log(`Inserted ${insertResult.insertedCount} posts successfully`);
    
    // Create optimized indexes
    await collection.createIndex({ frequency_rank: 1 });
    await collection.createIndex({ media_frequency: 1 });
    await collection.createIndex({ difficulty: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ exerciseType: 1 });
    await collection.createIndex({ priority: 1 });
    await collection.createIndex({ type: 1 });
    console.log('Created frequency-optimized indexes');
    
    // Verify the data
    const count = await collection.countDocuments();
    const highFreqCount = await collection.countDocuments({ media_frequency: "high" });
    const sumoCount = await collection.countDocuments({ type: "Sumo Post" });
    console.log(`Total posts: ${count}, High-frequency posts: ${highFreqCount}, Sumo posts: ${sumoCount}`);
    
    await client.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: '120 frequency-based posts populated successfully',
        postsInserted: insertResult.insertedCount,
        totalPosts: count,
        breakdown: {
          dailyLife: allPosts.filter(p => p.type.includes('Daily')).length,
          food: allPosts.filter(p => p.type.includes('Food')).length,
          casual: allPosts.filter(p => p.type.includes('Casual')).length,
          sumo: allPosts.filter(p => p.type.includes('Sumo')).length
        },
        highFrequencyPosts: highFreqCount,
        sumoPosts: sumoCount,
        approach: 'frequency-based with sumo expansion',
        note: 'Content prioritizes words from Japanese subtitle analysis + comprehensive sumo terminology'
      })
    };
    
  } catch (error) {
    console.error('Error populating 120 posts:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        approach: '120-post generation failed'
      })
    };
  }
};
