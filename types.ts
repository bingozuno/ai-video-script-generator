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

// --- THÊM PHẦN ĐA NGÔN NGỮ ---
export type Language = 'vi' | 'en';

export interface Translation {
  title: string;
  ideaMode: string;
  scriptMode: string;
  inputPlaceholder: string;
  styleLabel: string;
  ratioLabel: string;
  generateBtn: string;
  generatingBtn: string;
  // Thêm các từ khóa khác nếu cần
  tabScript: string;
  tabWatermark: string;
  buyCoffee: string;
  coffeeTitle: string;
  coffeeDesc1: string;
  coffeeDesc2: string;
  close: string;
}