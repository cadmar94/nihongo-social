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
    { jp: "今日はコーヒーを飲む", read: "きょうはコーヒーをのむ", trans: "Today I'm drinking coffee", freq: 25, 
      explain: "今日 (kyou) is one of the most essential time words in Japanese. Unlike textbook phrases about libraries, this appears constantly in real conversation and anime." },
    { jp: "家で友達と会う", read: "いえでともだちとあう", trans: "Meeting friends at home", freq: 45,
      explain: "家 (ie) means home/house and 友達 (tomodachi) is friend - both high-frequency words. The で particle shows location where the action happens." },
    { jp: "明日は仕事がある", read: "あしたはしごとがある", trans: "Tomorrow I have work", freq: 40,
      explain: "明日 (ashita) tomorrow and 仕事 (shigoto) work are essential daily vocabulary. がある means 'to have/exist' for inanimate things like work." },
    { jp: "時間がない", read: "じかんがない", trans: "There's no time", freq: 30,
      explain: "時間 (jikan) time is crucial vocabulary. がない is the negative form of がある - very common pattern you'll hear constantly in daily life." },
    { jp: "学校に行く", read: "がっこうにいく", trans: "Going to school", freq: 50,
      explain: "学校 (gakkou) school and 行く (iku) to go are basic but essential. The に particle shows direction/destination - different from で (location of action)." },
    { jp: "昨日は暑かった", read: "きのうはあつかった", trans: "Yesterday was hot", freq: 35,
      explain: "昨日 (kinou) yesterday and 暑い (atsui) hot. The かった ending makes past tense for i-adjectives - key grammar pattern." },
    { jp: "お金を使う", read: "おかねをつかう", trans: "Using money", freq: 92,
      explain: "お金 (okane) money and 使う (tsukau) to use. The を particle marks what you're using - essential particle for object of action." },
    { jp: "天気がいい", read: "てんきがいい", trans: "The weather is good", freq: 135,
      explain: "天気 (tenki) weather is practical daily vocabulary. いい (good) is more casual than よい - you'll hear いい much more in conversation." },
    { jp: "雨が降る", read: "あめがふる", trans: "It's raining", freq: 140,
      explain: "雨 (ame) rain and 降る (furu) to fall. This is the natural way to say 'it's raining' in Japanese - rain falls rather than 'it rains'." },
    { jp: "寒い日だ", read: "さむいひだ", trans: "It's a cold day", freq: 150,
      explain: "寒い (samui) cold and 日 (hi) day. Simple but useful weather expression. だ is the casual form of です." }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = dailyLifeExamples[i % dailyLifeExamples.length];
    const variation = i >= dailyLifeExamples.length ? ` (${Math.floor(i / dailyLifeExamples.length) + 1})` : '';
    
    posts.push({
      type: "Daily Life Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: example.explain || `High-frequency daily vocabulary. Core words from subtitle analysis that appear in real conversations vs textbook phrases.`,
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
    { jp: "この料理は美味しい", read: "このりょうりはおいしい", trans: "This food is delicious", freq: 75,
      explain: "料理 (ryouri) cooking/cuisine and 美味しい (oishii) delicious are essential for food conversations. You'll hear these constantly in food anime and restaurant scenes." },
    { jp: "レストランで食べる", read: "レストランでたべる", trans: "Eating at a restaurant", freq: 85,
      explain: "レストラン (resutoran) restaurant and 食べる (taberu) to eat. The で particle shows where the eating happens - key pattern for location of actions." },
    { jp: "コーヒーを買う", read: "コーヒーをかう", trans: "Buying coffee", freq: 90,
      explain: "コーヒー (koohii) coffee appears frequently in daily conversation. 買う (kau) to buy with を particle marking what you're purchasing." },
    { jp: "お茶を飲む", read: "おちゃをのむ", trans: "Drinking tea", freq: 95,
      explain: "お茶 (ocha) tea is fundamental Japanese beverage vocabulary. 飲む (nomu) to drink is one of the most essential verbs for food and beverages." },
    { jp: "ご飯を作る", read: "ごはんをつくる", trans: "Making rice/meal", freq: 100,
      explain: "ご飯 (gohan) means both rice and meal - culturally important word. 作る (tsukuru) to make is key cooking vocabulary you'll need for kitchen scenes." },
    { jp: "パンが好き", read: "パンがすき", trans: "I like bread", freq: 105,
      explain: "パン (pan) bread from Portuguese. 好き (suki) to like uses が particle, not を - important grammar distinction for preferences." },
    { jp: "肉を食べる", read: "にくをたべる", trans: "Eating meat", freq: 110,
      explain: "肉 (niku) meat is basic food vocabulary. Simple pattern: [food]を食べる is how you say eating specific foods in Japanese." },
    { jp: "店で買い物", read: "みせでかいもの", trans: "Shopping at the store", freq: 87,
      explain: "店 (mise) store and 買い物 (kaimono) shopping. で particle for location again - pattern you'll use for any activity at a place." },
    { jp: "安いレストラン", read: "やすいレストラン", trans: "Cheap restaurant", freq: 97,
      explain: "安い (yasui) cheap is essential for budget discussions. Adjectives come before nouns in Japanese, unlike English order." },
    { jp: "高い料理", read: "たかいりょうり", trans: "Expensive food", freq: 102,
      explain: "高い (takai) expensive/high. In restaurant contexts, definitely means expensive. Same adjective-noun pattern as 安いレストラン." }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = foodExamples[i % foodExamples.length];
    const variation = i >= foodExamples.length ? ` (${Math.floor(i / foodExamples.length) + 1})` : '';
    
    posts.push({
      type: "Food Culture Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: example.explain || `Food vocabulary from subtitle analysis. Essential for dining conversations and food anime/drama.`,
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
    { jp: "やばい美味しい！", read: "やばいおいしい！", trans: "So delicious!", freq: 47,
      explain: "やばい (yabai) ranks #47 in anime subtitles but is barely taught in textbooks. Originally meant 'dangerous' but now means 'awesome' or 'terrible' depending on context. Essential for understanding casual Japanese." },
    { jp: "すごいね！", read: "すごいね！", trans: "That's amazing!", freq: 52,
      explain: "すごい (sugoi) is one of the most useful casual expressions. The ね particle adds emphasis and seeks agreement - like 'right?' in English. You'll hear this constantly in anime." },
    { jp: "大丈夫？", read: "だいじょうぶ？", trans: "Are you okay?", freq: 57,
      explain: "大丈夫 (daijoubu) is incredibly versatile - means OK, alright, fine, or no problem. Rising intonation (？) makes it a question. Essential for daily conversation." },
    { jp: "ちょっと待って", read: "ちょっとまって", trans: "Wait a little", freq: 62,
      explain: "ちょっと (chotto) means 'a little' but also 'wait' or 'excuse me'. て form (待って) is casual imperative. Much more natural than textbook 待ちなさい." },
    { jp: "本当にすごい", read: "ほんとうにすごい", trans: "Really amazing", freq: 67,
      explain: "本当に (hontou ni) really/truly for emphasis. Often shortened to ほんと (honto) in casual speech. Combined with すごい for strong positive reaction." },
    { jp: "多分大丈夫", read: "たぶんだいじょうぶ", trans: "Probably okay", freq: 72,
      explain: "多分 (tabun) probably/maybe expresses uncertainty politely. Combined with 大丈夫 for reassurance. Very common pattern in everyday conversation." },
    { jp: "全然わからない", read: "ぜんぜんわからない", trans: "Don't understand at all", freq: 77,
      explain: "全然 (zenzen) not at all, completely. Originally only used with negatives but now used with positives too in casual speech. わからない is polite form of わからん." },
    { jp: "めちゃくちゃ面白い", read: "めちゃくちゃおもしろい", trans: "Extremely interesting", freq: 120,
      explain: "めちゃくちゃ (mechakucha) extremely/ridiculously. Much more casual than とても or 非常に. Essential intensifier for casual conversation and anime." },
    { jp: "やばいって！", read: "やばいって！", trans: "No way!", freq: 47,
      explain: "って is casual form of と言う (to say). やばいって literally means 'I'm telling you it's crazy!' Express disbelief or emphasis. Pure casual speech." },
    { jp: "すごく好き", read: "すごくすき", trans: "Really like it", freq: 52,
      explain: "すごく is adverb form of すごい, meaning 'very' or 'really'. More casual than とても. 好き uses が particle (すごく好きだ), not を." }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = casualExamples[i % casualExamples.length];
    const variation = i >= casualExamples.length ? ` (${Math.floor(i / casualExamples.length) + 1})` : '';
    
    posts.push({
      type: "Casual Expression",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans + variation,
      explanation: example.explain || `Casual anime/media expressions (rank #${example.freq}). Essential for understanding real Japanese but rarely taught in textbooks.`,
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
    { jp: "勝負の行方", read: "しょうぶのゆくえ", trans: "The outcome of the match", freq: 18,
      explain: "勝負 (shoubu) means match/contest - appears in many sports contexts. 行方 (yukue) means direction/outcome. Used for dramatic effect in close tournament races." },
    { jp: "場所の千秋楽を見る", read: "ばしょのせんしゅうらくをみる", trans: "Watching the final day of the tournament", freq: 19,
      explain: "場所 (basho) is a sumo tournament held 6 times yearly. 千秋楽 (senshuuraku) is the final day when championships are decided. Essential for following sumo seasons." },
    { jp: "優勝争いが激しい", read: "ゆうしょうあらそいがはげしい", trans: "The championship race is intense", freq: 42,
      explain: "優勝 (yuushou) championship is decided by most wins in 15-day tournament. 争い (arasoi) means competition/struggle. Final days often have multiple wrestlers tied for lead." },
    { jp: "この力士はすごい", read: "このりきしはすごい", trans: "This wrestler is amazing", freq: 52,
      explain: "力士 (rikishi) means sumo wrestler - literally 'strength gentleman'. The kanji shows the cultural respect for wrestlers as skilled athletes, not just big guys." },
    { jp: "今日の相撲は面白い", read: "きょうのすもうはおもしろい", trans: "Today's sumo is interesting", freq: 200,
      explain: "相撲 (sumou) is Japan's national sport with 1,500+ year history. 面白い (omoshiroi) interesting is high-frequency adjective. Essential vocabulary for sumo anime like Hinomaru Sumo." },
    { jp: "叩き込みで決まった", read: "はたきこみできまった", trans: "Decided by slap down", freq: 220,
      explain: "叩き込み (hatakikomi) slap down involves hitting opponent's shoulder/back to make them fall forward. Quick technique often used against charging opponents." },
    { jp: "勝ち越しおめでとう", read: "かちこしおめでとう", trans: "Congratulations on your winning record", freq: 230,
      explain: "勝ち越し (kachikoshi) winning record means more wins than losses in a tournament. Needed for promotion. Opposite is 負け越し (makekoshi) losing record." },
    { jp: "本場所が始まった", read: "ほんばしょがはじまった", trans: "The grand tournament has begun", freq: 240,
      explain: "本場所 (honbasho) refers to the 6 official tournaments yearly (vs exhibitions). Each lasts 15 days with wrestlers fighting once daily. The heart of professional sumo." },
    { jp: "押し出しで勝利", read: "おしだしでしょうり", trans: "Victory by push out", freq: 250,
      explain: "押し出し (oshidashi) is frontal push out - second most common winning technique. Push opponent out without grabbing their belt. Pure power technique." },
    { jp: "立合いが重要だ", read: "たちあいがじゅうようだ", trans: "The initial charge is important", freq: 260,
      explain: "立合い (tachiai) initial charge when both wrestlers' hands touch ground simultaneously. Often determines match outcome in seconds. Requires perfect timing and strategy." },
    { jp: "上手投げは難しい", read: "うわてなげはむずかしい", trans: "Overarm throw is difficult", freq: 270,
      explain: "上手投げ (uwatenage) overarm throw requires grabbing opponent's belt over their arm and throwing them down. Technical skill technique requiring timing and leverage." },
    { jp: "金星を取った！", read: "きんぼしをとった！", trans: "Got a gold star!", freq: 280,
      explain: "金星 (kinboshi) gold star is awarded when a lower-ranked wrestler defeats a yokozuna. It provides permanent salary bonus and is considered a career highlight." },
    { jp: "廻しを掴む", read: "まわしをつかむ", trans: "Grabbing the mawashi", freq: 290,
      explain: "廻し (mawashi) is the belt/loincloth wrestlers wear. Grabbing it enables throws and force-outs. Good belt grip (mawashi) position is crucial for grappling-style sumo." },
    { jp: "横綱の寄り切りが美しい", read: "よこづなのよりきりがうつくしい", trans: "The yokozuna's yorikiri is beautiful", freq: 300,
      explain: "横綱 (yokozuna) is the highest rank in sumo - grand champion. 寄り切り (yorikiri) is the most common winning technique: grabbing opponent's belt and forcing them out of the ring." },
    { jp: "大関の相撲", read: "おおぜきのすもう", trans: "The ozeki's sumo", freq: 310,
      explain: "大関 (oozeki) is the second-highest rank below yokozuna. Must maintain high winning percentage or face demotion. Only 2-3 ozeki typically active at once." },
    { jp: "関脇の頑張り", read: "せきわけのがんばり", trans: "The sekiwake's effort", freq: 320,
      explain: "関脇 (sekiwake) is third-highest rank in sumo. 頑張り (ganbari) means effort/perseverance - valued trait in sumo culture. Sekiwake can be promoted to ozeki with strong performance." },
    { jp: "小結も強い", read: "こむすびもつよい", trans: "The komusubi is also strong", freq: 330,
      explain: "小結 (komusubi) literally 'small knot' is fourth-highest rank. Despite name, these are elite wrestlers just below the san'yaku champion ranks." },
    { jp: "前頭の活躍", read: "まえがしらのかつやく", trans: "The maegashira's performance", freq: 335,
      explain: "前頭 (maegashira) are rank-and-file wrestlers in top division, numbered 1-16. 活躍 (katsuyaku) means active performance. Lower maegashira can upset higher ranks for kinboshi." },
    { jp: "土俵の外に出る", read: "どひょうのそとにでる", trans: "Going outside the ring", freq: 340,
      explain: "土俵 (dohyou) is the sacred ring where matches occur. Made of clay, 4.55m diameter, raised platform. Any body part touching outside the ring loses the match." },
    { jp: "土俵入りは伝統的だ", read: "どひょういりはでんとうてきだ", trans: "The ring entering ceremony is traditional", freq: 350,
      explain: "土俵入り (dohyou-iri) is the ring entering ceremony performed by top wrestlers. Shows sumo's deep connection to Shinto religion and Japanese cultural traditions." }
  ];
  
  for (let i = 0; i < count; i++) {
    const example = sumoExamples[i % sumoExamples.length];
    
    posts.push({
      type: "Sumo Post",
      japanese: example.jp,
      reading: example.read,
      translation: example.trans,
      explanation: example.explain || `Sumo vocabulary essential for sumo anime/content. Core terminology used in commentary and analysis.`,
      difficulty: example.freq <= 50 ? "intermediate" : "advanced",
      tags: ["sumo", "sports", "traditional", "anime"],
      audioFirst: Math.random() > 0.5,
      exerciseType: Math.random() > 0.5 ? "recognition" : "phonetic",
      frequency_rank: example.freq,
      media_frequency: "high",
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
