// Japanese Learning Data
export interface Character {
  character: string;
  romaji: string;
  meaning?: string;
  strokeOrder?: string[];
  audioUrl?: string;
  examples?: string[];
}

export interface Kanji extends Omit<Character, 'meaning'> {
  meaning: string; // Required for Kanji
  readings: {
    kunyomi: string[];
    onyomi: string[];
  };
  grade: number;
  jlpt: number;
}

export interface Vocabulary {
  japanese: string;
  romaji: string;
  english: string;
  category: string;
  jlpt: number;
  examples?: string[];
}

export interface GrammarPoint {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: Array<{
    japanese: string;
    romaji: string;
    english: string;
  }>;
  level: 'beginner' | 'intermediate' | 'advanced';
}

// Hiragana Characters
export const hiraganaData: Character[] = [
  { character: 'あ', romaji: 'a' },
  { character: 'い', romaji: 'i' },
  { character: 'う', romaji: 'u' },
  { character: 'え', romaji: 'e' },
  { character: 'お', romaji: 'o' },
  { character: 'か', romaji: 'ka' },
  { character: 'き', romaji: 'ki' },
  { character: 'く', romaji: 'ku' },
  { character: 'け', romaji: 'ke' },
  { character: 'こ', romaji: 'ko' },
  { character: 'さ', romaji: 'sa' },
  { character: 'し', romaji: 'shi' },
  { character: 'す', romaji: 'su' },
  { character: 'せ', romaji: 'se' },
  { character: 'そ', romaji: 'so' },
  { character: 'た', romaji: 'ta' },
  { character: 'ち', romaji: 'chi' },
  { character: 'つ', romaji: 'tsu' },
  { character: 'て', romaji: 'te' },
  { character: 'と', romaji: 'to' },
  { character: 'な', romaji: 'na' },
  { character: 'に', romaji: 'ni' },
  { character: 'ぬ', romaji: 'nu' },
  { character: 'ね', romaji: 'ne' },
  { character: 'の', romaji: 'no' },
  { character: 'は', romaji: 'ha' },
  { character: 'ひ', romaji: 'hi' },
  { character: 'ふ', romaji: 'fu' },
  { character: 'へ', romaji: 'he' },
  { character: 'ほ', romaji: 'ho' },
  { character: 'ま', romaji: 'ma' },
  { character: 'み', romaji: 'mi' },
  { character: 'む', romaji: 'mu' },
  { character: 'め', romaji: 'me' },
  { character: 'も', romaji: 'mo' },
  { character: 'や', romaji: 'ya' },
  { character: 'ゆ', romaji: 'yu' },
  { character: 'よ', romaji: 'yo' },
  { character: 'ら', romaji: 'ra' },
  { character: 'り', romaji: 'ri' },
  { character: 'る', romaji: 'ru' },
  { character: 'れ', romaji: 're' },
  { character: 'ろ', romaji: 'ro' },
  { character: 'わ', romaji: 'wa' },
  { character: 'ん', romaji: 'n' },
];

// Katakana Characters
export const katakanaData: Character[] = [
  { character: 'ア', romaji: 'a' },
  { character: 'イ', romaji: 'i' },
  { character: 'ウ', romaji: 'u' },
  { character: 'エ', romaji: 'e' },
  { character: 'オ', romaji: 'o' },
  { character: 'カ', romaji: 'ka' },
  { character: 'キ', romaji: 'ki' },
  { character: 'ク', romaji: 'ku' },
  { character: 'ケ', romaji: 'ke' },
  { character: 'コ', romaji: 'ko' },
  { character: 'サ', romaji: 'sa' },
  { character: 'シ', romaji: 'shi' },
  { character: 'ス', romaji: 'su' },
  { character: 'セ', romaji: 'se' },
  { character: 'ソ', romaji: 'so' },
  { character: 'タ', romaji: 'ta' },
  { character: 'チ', romaji: 'chi' },
  { character: 'ツ', romaji: 'tsu' },
  { character: 'テ', romaji: 'te' },
  { character: 'ト', romaji: 'to' },
  { character: 'ナ', romaji: 'na' },
  { character: 'ニ', romaji: 'ni' },
  { character: 'ヌ', romaji: 'nu' },
  { character: 'ネ', romaji: 'ne' },
  { character: 'ノ', romaji: 'no' },
  { character: 'ハ', romaji: 'ha' },
  { character: 'ヒ', romaji: 'hi' },
  { character: 'フ', romaji: 'fu' },
  { character: 'ヘ', romaji: 'he' },
  { character: 'ホ', romaji: 'ho' },
  { character: 'マ', romaji: 'ma' },
  { character: 'ミ', romaji: 'mi' },
  { character: 'ム', romaji: 'mu' },
  { character: 'メ', romaji: 'me' },
  { character: 'モ', romaji: 'mo' },
  { character: 'ヤ', romaji: 'ya' },
  { character: 'ユ', romaji: 'yu' },
  { character: 'ヨ', romaji: 'yo' },
  { character: 'ラ', romaji: 'ra' },
  { character: 'リ', romaji: 'ri' },
  { character: 'ル', romaji: 'ru' },
  { character: 'レ', romaji: 're' },
  { character: 'ロ', romaji: 'ro' },
  { character: 'ワ', romaji: 'wa' },
  { character: 'ン', romaji: 'n' },
];

// Essential Kanji
export const kanjiData: Kanji[] = [
  {
    character: '人',
    romaji: 'hito',
    meaning: 'person',
    readings: { kunyomi: ['hito'], onyomi: ['jin', 'nin'] },
    grade: 1,
    jlpt: 5,
    examples: ['人間 (ningen) - human', '日本人 (nihonjin) - Japanese person']
  },
  {
    character: '日',
    romaji: 'hi',
    meaning: 'sun, day',
    readings: { kunyomi: ['hi'], onyomi: ['nichi'] },
    grade: 1,
    jlpt: 5,
    examples: ['今日 (kyou) - today', '日本 (nihon) - Japan']
  },
  {
    character: '本',
    romaji: 'hon',
    meaning: 'book, main',
    readings: { kunyomi: ['moto'], onyomi: ['hon'] },
    grade: 1,
    jlpt: 5,
    examples: ['本 (hon) - book', '日本 (nihon) - Japan']
  },
  {
    character: '水',
    romaji: 'mizu',
    meaning: 'water',
    readings: { kunyomi: ['mizu'], onyomi: ['sui'] },
    grade: 1,
    jlpt: 5,
    examples: ['水 (mizu) - water', '水曜日 (suiyoubi) - Wednesday']
  },
  {
    character: '火',
    romaji: 'hi',
    meaning: 'fire',
    readings: { kunyomi: ['hi'], onyomi: ['ka'] },
    grade: 1,
    jlpt: 5,
    examples: ['火 (hi) - fire', '火曜日 (kayoubi) - Tuesday']
  },
  {
    character: '木',
    romaji: 'ki',
    meaning: 'tree, wood',
    readings: { kunyomi: ['ki'], onyomi: ['moku', 'boku'] },
    grade: 1,
    jlpt: 5,
    examples: ['木 (ki) - tree', '木曜日 (mokuyoubi) - Thursday']
  },
  {
    character: '金',
    romaji: 'kane',
    meaning: 'gold, money',
    readings: { kunyomi: ['kane'], onyomi: ['kin'] },
    grade: 1,
    jlpt: 5,
    examples: ['お金 (okane) - money', '金曜日 (kinyoubi) - Friday']
  },
  {
    character: '土',
    romaji: 'tsuchi',
    meaning: 'earth, soil',
    readings: { kunyomi: ['tsuchi'], onyomi: ['do'] },
    grade: 1,
    jlpt: 5,
    examples: ['土 (tsuchi) - soil', '土曜日 (doyoubi) - Saturday']
  }
];

// Essential Vocabulary
export const vocabularyData: Vocabulary[] = [
  { japanese: 'こんにちは', romaji: 'konnichiwa', english: 'hello', category: 'greetings', jlpt: 5 },
  { japanese: 'ありがとう', romaji: 'arigatou', english: 'thank you', category: 'greetings', jlpt: 5 },
  { japanese: 'はじめまして', romaji: 'hajimemashite', english: 'nice to meet you', category: 'greetings', jlpt: 5 },
  { japanese: 'すみません', romaji: 'sumimasen', english: 'excuse me', category: 'greetings', jlpt: 5 },
  { japanese: 'はい', romaji: 'hai', english: 'yes', category: 'basic', jlpt: 5 },
  { japanese: 'いいえ', romaji: 'iie', english: 'no', category: 'basic', jlpt: 5 },
  { japanese: 'わたし', romaji: 'watashi', english: 'I, me', category: 'pronouns', jlpt: 5 },
  { japanese: 'あなた', romaji: 'anata', english: 'you', category: 'pronouns', jlpt: 5 },
  { japanese: 'これ', romaji: 'kore', english: 'this', category: 'demonstratives', jlpt: 5 },
  { japanese: 'それ', romaji: 'sore', english: 'that', category: 'demonstratives', jlpt: 5 },
  { japanese: 'あれ', romaji: 'are', english: 'that over there', category: 'demonstratives', jlpt: 5 },
  { japanese: 'どれ', romaji: 'dore', english: 'which', category: 'demonstratives', jlpt: 5 },
  { japanese: 'いち', romaji: 'ichi', english: 'one', category: 'numbers', jlpt: 5 },
  { japanese: 'に', romaji: 'ni', english: 'two', category: 'numbers', jlpt: 5 },
  { japanese: 'さん', romaji: 'san', english: 'three', category: 'numbers', jlpt: 5 },
  { japanese: 'よん', romaji: 'yon', english: 'four', category: 'numbers', jlpt: 5 },
  { japanese: 'ご', romaji: 'go', english: 'five', category: 'numbers', jlpt: 5 },
  { japanese: 'がっこう', romaji: 'gakkou', english: 'school', category: 'places', jlpt: 5 },
  { japanese: 'いえ', romaji: 'ie', english: 'house', category: 'places', jlpt: 5 },
  { japanese: 'みず', romaji: 'mizu', english: 'water', category: 'food', jlpt: 5 },
];

// Grammar Points
export const grammarData: GrammarPoint[] = [
  {
    pattern: 'は (wa)',
    meaning: 'Topic marker',
    explanation: 'は marks the topic of the sentence. It is pronounced "wa" when used as a particle.',
    examples: [
      {
        japanese: 'わたしは がくせい です。',
        romaji: 'Watashi wa gakusei desu.',
        english: 'I am a student.'
      },
      {
        japanese: 'これは ほん です。',
        romaji: 'Kore wa hon desu.',
        english: 'This is a book.'
      }
    ],
    level: 'beginner'
  },
  {
    pattern: 'です (desu)',
    meaning: 'Polite copula',
    explanation: 'です is used to make statements polite. It means "to be" in English.',
    examples: [
      {
        japanese: 'せんせい です。',
        romaji: 'Sensei desu.',
        english: 'I am a teacher.'
      },
      {
        japanese: 'にほんじん です。',
        romaji: 'Nihonjin desu.',
        english: 'I am Japanese.'
      }
    ],
    level: 'beginner'
  },
  {
    pattern: 'を (wo/o)',
    meaning: 'Direct object marker',
    explanation: 'を marks the direct object of a verb. It is pronounced "o".',
    examples: [
      {
        japanese: 'ほんを よみます。',
        romaji: 'Hon wo yomimasu.',
        english: 'I read a book.'
      },
      {
        japanese: 'すしを たべます。',
        romaji: 'Sushi wo tabemasu.',
        english: 'I eat sushi.'
      }
    ],
    level: 'beginner'
  }
];

// Numbers
export const numbersData = {
  basic: [
    { number: 1, hiragana: 'いち', romaji: 'ichi' },
    { number: 2, hiragana: 'に', romaji: 'ni' },
    { number: 3, hiragana: 'さん', romaji: 'san' },
    { number: 4, hiragana: 'よん', romaji: 'yon' },
    { number: 5, hiragana: 'ご', romaji: 'go' },
    { number: 6, hiragana: 'ろく', romaji: 'roku' },
    { number: 7, hiragana: 'なな', romaji: 'nana' },
    { number: 8, hiragana: 'はち', romaji: 'hachi' },
    { number: 9, hiragana: 'きゅう', romaji: 'kyuu' },
    { number: 10, hiragana: 'じゅう', romaji: 'juu' }
  ]
};