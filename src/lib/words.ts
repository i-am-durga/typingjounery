export const COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

export const ADVANCED_WORDS = [
    "aberration", "capricious", "dichotomy", "ephemeral", "facetious",
    "gregarious", "hubris", "ineffable", "juxtaposition", "kinetic",
    "loquacious", "magnanimous", "nonchalant", "obfuscate", "paradigm",
    "quixotic", "resilient", "serendipity", "tangential", "ubiquitous",
    "vacillate", "winsome", "xenophile", "yearn", "zealous",
    "aesthetic", "benevolent", "cacophony", "dexterous", "esoteric",
    "fastidious", "garrulous", "harangue", "iconoclast", "jovial",
    "kudos", "lethargic", "mellifluous", "nostalgia", "ostentatious",
    "pragmatic", "quintessential", "rhetoric", "sycophant", "trepidation",
    "unilateral", "verbose", "wane", "xylophone", "yacht", "zenith"
];

export const QUOTES = [
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Do what you can, with what you have, where you are.",
    "It is never too late to be what you might have been.",
    "In the middle of difficulty lies opportunity.",
    "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    "The way to get started is to quit talking and begin doing.",
    "Don't let yesterday take up too much of today.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export interface WordGenerationOptions {
    count?: number;
    mode?: 'timed' | 'words' | 'quote' | 'zen' | 'ghost' | 'custom';
    includeNumbers?: boolean;
    includePunctuation?: boolean;
    useAdvancedWords?: boolean;
    customText?: string;
}

export function generateWords(options: WordGenerationOptions = {}): string {
    const {
        count = 50,
        mode = 'words',
        includeNumbers = false,
        includePunctuation = false,
        useAdvancedWords = false,
        customText = ""
    } = options;

    if (mode === 'custom' && customText) {
        return customText;
    }

    if (mode === 'quote') {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[randomIndex];
    }

    const wordList = useAdvancedWords ? [...COMMON_WORDS, ...ADVANCED_WORDS] : COMMON_WORDS;
    const generatedWords: string[] = [];

    // For timed/words/zen/ghost modes, generate a sequence of random words
    const targetCount = mode === 'timed' || mode === 'zen' || mode === 'ghost' ? 150 : count; // Generous amount for timed/zen

    for (let i = 0; i < targetCount; i++) {
        let word = wordList[Math.floor(Math.random() * wordList.length)];

        if (includeNumbers && Math.random() > 0.8) {
            word = `${word}${Math.floor(Math.random() * 100)}`;
        }

        if (includePunctuation && Math.random() > 0.8) {
            const punctuations = [",", ".", "!", "?", ";", ":"];
            const punc = punctuations[Math.floor(Math.random() * punctuations.length)];
            word = `${word}${punc}`;
        }

        // Random capitalization for added difficulty
        if (includePunctuation && Math.random() > 0.8) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        generatedWords.push(word);
    }

    return generatedWords.join(" ");
}
