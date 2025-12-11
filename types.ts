export interface Scene {
  sceneNumber: string;
  duration: string;
  description: string;
  imagePrompt: string;
  motionPrompt: string;
  generatedImages?: string[];
  isGeneratingImages?: boolean;
  isRegeneratingPrompt?: boolean;
}

export interface Script {
  scenes: Scene[];
}

export interface StyleInfo {
  name: string;
  prompt: string;
  definition: string;
}

export interface CharacterReference {
  id: string;
  name: string;
  imageBase64: string | null;
  fileType: string | null;
  description: string;
  isAnalyzing: boolean;
}

export interface ProjectState {
  mode: 'idea' | 'script';
  ideaInput: string;
  longStoryInput: string;
  storyChapters: StoryChapter[];
  selectedStylePrompts?: string[];
  characterReferences: CharacterReference[];
  characterDefinition: string;
  aspectRatio: string;
  generateImage: boolean;
  generateMotion: boolean;
  includeMusic: boolean;
  dialogueLanguage: string;
  limitCharacterCount: boolean;
  limitPromptLength: boolean; // <--- Đã thêm: Giới hạn 1600 ký tự
  selectedModel?: string; 
  script: Script | null;
}

export interface StorytellingScene {
  sceneNumber: string;
  originalDialogue: string;
  translatedDialogue: string;
  imageMeaning: string;
  imagePrompt: string;
  motionPrompt: string;
}

export interface StoryChapter {
  id: string;
  text: string;
}

// --- ĐỊNH NGHĨA NGÔN NGỮ ---
export type Language = 'vi' | 'en';

export interface Translation {
  title: string;
  // Header Text
  headerTitle: string;
  headerSubtitle: string;
  developedBy: string;
  // API Bar
  apiKeyLabel: string;
  getKey: string;
  save: string;
  delete: string;
  savedMsg: string;
  deletedMsg: string;
  // Main UI
  ideaMode: string;
  scriptMode: string;
  inputPlaceholder: string;
  styleLabel: string;
  ratioLabel: string;
  generateBtn: string;
  generatingBtn: string;
  tabScript: string;
  tabWatermark: string;
  buyCoffee: string;
  coffeeTitle: string;
  coffeeDesc1: string;
  coffeeDesc2: string;
  close: string;
  // Model & Manage
  manageTitle: string;
  export: string;
  import: string;
  selectModel: string;
  // Input Form
  inputStory: string;
  splitRange: string;
  chars: string;
  splitNum: string;
  chapters: string;
  splitBtn: string;
  scenesDone: string;
  noChapters: string;
  noChaptersHint: string;
  charSource1: string;
  charSource2: string;
  charDefHint: string;
  autoGen: string;
  analyzing: string;
  charRefHint: string;
  dropImage: string;
  uploadImage: string;
  analyzeAI: string;
  addChar: string;
  customDetail: string;
  imgPrompt: string;
  limitChar: string;
  limit1600Char: string; // <--- Đã thêm: Label cho nút giới hạn 1600
  motionPrompt: string;
  createBtn: string;
  createBatch: string;
  music: string;
  dialogueLang: string;
  styleTitle: string;
  styleAdd: string;
  styleClose: string;
  ratioTitle: string;
  ratioAdd: string;
}