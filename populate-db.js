// populate-database.js
// Script to populate MongoDB with initial Japanese learning posts

const { MongoClient } = require('mongodb');

// Your existing posts from the app
const initialPosts = [
  {
    type: "Morning Post",
    japanese: "おはようございます！",
    reading: "",
    translation: "Good morning!",
    explanation: "The polite morning greeting. More formal than おはよう. Used until about 10 AM.",
    difficulty: "beginner",
    tags: ["daily-life", "greeting", "formal"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Café Post",
    japanese: "今日のコーヒーは美味しいです",
    reading: "きょうのコーヒーはおいしいです",
    translation: "Today's coffee is delicious",
    explanation: "Compare: 今日 (kanji) vs きょう (hiragana), 美味しい vs おいしい - same pronunciation, different writing. Your brain needs to connect the SOUND to meaning, not just the visual kanji.",
    difficulty: "beginner",
    tags: ["food", "adjective", "daily-life"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Restaurant Post",
    japanese: "この寿司は新鮮です",
    reading: "このすしはしんせんです",
    translation: "This sushi is fresh",
    explanation: "新鮮 (shinsen) means fresh/new. この (kono) means 'this' - a common demonstrative.",
    difficulty: "intermediate",
    tags: ["food", "restaurant", "adjective"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Office Update",
    japanese: "会議は来週です",
    reading: "かいぎは らいしゅうです",
    translation: "The meeting is next week",
    explanation: "Same as 会議は来週です but notice how different writing affects recognition? 会議 (kaigi) = meeting, 来週 (raishuu) = next week.",
    difficulty: "beginner",
    tags: ["work", "business", "time"],
    audioFirst: false,
    exerciseType: "phonetic"
  },
  {
    type: "Work Chat",
    japanese: "資料を送りました",
    reading: "しりょうをおくりました",
    translation: "I sent the materials",
    explanation: "資料 (shiryou) means materials/documents. を (wo) is the object particle. 送る (okuru) means to send.",
    difficulty: "intermediate",
    tags: ["work", "business", "verb"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Train Update",
    japanese: "電車が遅れています",
    reading: "でんしゃが おくれています",
    translation: "The train is running late",
    explanation: "電車 (densha) means train. 遅れる (okureru) means to be late/delayed. が marks the subject. Notice how your brain processes 電車 vs でんしゃ differently?",
    difficulty: "beginner",
    tags: ["transportation", "travel", "verb"],
    audioFirst: false,
    exerciseType: "phonetic"
  },
  {
    type: "Travel Blog",
    japanese: "京都はとても美しいです",
    reading: "きょうとはとてもうつくしいです",
    translation: "Kyoto is very beautiful",
    explanation: "美しい (utsukushii) means beautiful - more formal than きれい (kirei). とても (totemo) means very.",
    difficulty: "intermediate",
    tags: ["travel", "adjective", "place"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Recipe Share",
    japanese: "らーめんを つくります",
    reading: "らーめんを つくります",
    translation: "I'm making ramen",
    explanation: "Compare with ラーメンを作ります - katakana vs hiragana for foreign words. Both are correct.",
    difficulty: "beginner",
    tags: ["food", "cooking", "verb"],
    audioFirst: false,
    exerciseType: "phonetic"
  },
  {
    type: "Food Review",
    japanese: "天ぷらが有名な店です",
    reading: "てんぷらがゆうめいなみせです",
    translation: "It's a restaurant famous for tempura",
    explanation: "有名 (yuumei) means famous. な (na) connects adjectives to nouns. 店 (mise) means shop/restaurant.",
    difficulty: "intermediate",
    tags: ["food", "restaurant", "adjective"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Weather Update",
    japanese: "あしたは あめが ふる",
    reading: "あしたは あめが ふる",
    translation: "Tomorrow it will rain",
    explanation: "Casual form without でしょう. 降る (furu) is the dictionary form. Spaced hiragana for phonetic practice.",
    difficulty: "beginner",
    tags: ["weather", "casual", "verb"],
    audioFirst: true,
    exerciseType: "phonetic"
  },
  {
    type: "Nature Photo",
    japanese: "桜が咲いています",
    reading: "さくらがさいています",
    translation: "The cherry blossoms are blooming",
    explanation: "咲く (saku) means to bloom. ています form shows ongoing action. 桜 (sakura) is cherry blossom.",
    difficulty: "intermediate",
    tags: ["nature", "seasonal", "verb"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "JSA Official",
    japanese: "今日の取組は素晴らしかった！",
    reading: "きょうのとりくみはすばらしかった！",
    translation: "Today's matches were wonderful!",
    explanation: "取組 (torikumi) means 'match' in sumo. 素晴らしい (subarashii) is a common way to express 'wonderful' or 'magnificent'.",
    difficulty: "intermediate",
    tags: ["sports", "sumo", "adjective"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Stable Post",
    japanese: "あさげいこ がんばります",
    reading: "あさげいこ がんばります",
    translation: "We'll work hard at morning practice",
    explanation: "Hiragana version of 朝稽古頑張ります. 頑張る (ganbaru) is essential Japanese - means to persevere/work hard.",
    difficulty: "beginner",
    tags: ["sports", "sumo", "verb"],
    audioFirst: true,
    exerciseType: "phonetic"
  },
  {
    type: "Social Update",
    japanese: "写真をアップしました",
    reading: "しゃしんを アップしました",
    translation: "I uploaded a photo",
    explanation: "Compare: 写真 (kanji) vs しゃしん (hiragana) - same word, different writing. アップ (appu) is from English 'upload'. Both writing styles are correct.",
    difficulty: "beginner",
    tags: ["social-media", "technology", "verb"],
    audioFirst: false,
    exerciseType: "phonetic"
  },
  {
    type: "Tech News",
    japanese: "新しいゲームをダウンロードした",
    reading: "あたらしいゲームをダウンロードした",
    translation: "I downloaded a new game",
    explanation: "新しい (atarashii) means new. ゲーム (geemu) is from English 'game'. ダウンロード (daun-roodo) is from 'download' + した (past tense of する - to do).",
    difficulty: "intermediate",
    tags: ["technology", "gaming", "verb"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Shopping Post",
    japanese: "スーパーで買い物をしました",
    reading: "スーパーでかいものをしました",
    translation: "I did shopping at the supermarket",
    explanation: "買い物 (kaimono) means shopping. で (de) indicates location where action takes place.",
    difficulty: "beginner",
    tags: ["shopping", "daily-life", "verb"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Store Review",
    japanese: "この本屋は安いです",
    reading: "このほんやはやすいです",
    translation: "This bookstore is cheap",
    explanation: "本屋 (hon'ya) means bookstore. 安い (yasui) means cheap/inexpensive - opposite of 高い (takai).",
    difficulty: "beginner",
    tags: ["shopping", "books", "adjective"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Evening Post",
    japanese: "おつかれさまでした",
    reading: "おつかれさまでした",
    translation: "Thank you for your hard work",
    explanation: "Essential phrase used when finishing work or thanking someone for their effort. Very common in Japanese workplace culture.",
    difficulty: "beginner",
    tags: ["work", "greeting", "formal"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Night Post",
    japanese: "おやすみなさい",
    reading: "おやすみなさい",
    translation: "Good night",
    explanation: "Polite way to say good night. Casual version is just おやすみ.",
    difficulty: "beginner",
    tags: ["daily-life", "greeting", "formal"],
    audioFirst: false,
    exerciseType: "recognition"
  },
  {
    type: "Writing Practice",
    japanese: "たべる vs 食べる",
    reading: "たべる",
    translation: "to eat",
    explanation: "Same word, different writing. Both mean 'to eat'. Can you recognize them as the same when you hear them? This builds sound-meaning connections.",
    difficulty: "beginner",
    tags: ["writing-practice", "verb", "comparison"],
    audioFirst: true,
    exerciseType: "phonetic"
  },
  {
    type: "Writing Practice",
    japanese: "のむ vs 飲む",
    reading: "のむ",
    translation: "to drink",
    explanation: "Another hiragana vs kanji comparison. 飲む (nomu) is the kanji version. Same pronunciation, same meaning.",
    difficulty: "beginner",
    tags: ["writing-practice", "verb", "comparison"],
    audioFirst: true,
    exerciseType: "phonetic"
  }
];

async function populateDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    console.log('Connected successfully');
    
    const db = client.db('nihongo-social');
    const collection = db.collection('posts');
    
    // Clear existing posts
    await collection.deleteMany({});
    console.log('Cleared existing posts');
    
    // Insert new posts
    const result = await collection.insertMany(initialPosts);
    console.log(`Inserted ${result.insertedCount} posts`);
    
    // Create indexes for better performance
    await collection.createIndex({ difficulty: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ exerciseType: 1 });
    console.log('Created indexes');
    
    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Total posts in database: ${count}`);
    
    await client.close();
    console.log('Database populated successfully!');
    
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase, initialPosts };
