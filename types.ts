
export interface Scene {
  sceneNumber: string;
  description: string;
  imagePrompt: string;
  motionPrompt: string;
  generatedImages?: string[];
  isGeneratingImages?: boolean;
}

export interface Script {
  scenes: Scene[];
}

export interface StyleInfo {
  name: string;
  prompt: string;
  definition: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ProjectState {
  mode: 'idea' | 'script';
  ideaInput: string;
  // chatHistory removed
  scriptInput?: string; // For backwards compatibility
  storyChapters: StoryChapter[];
  stylePrompt?: string; // For backwards compatibility
  selectedStylePrompts?: string[];
  characterDefinition: string;
  aspectRatio: string;
  generateImage: boolean;
  generateMotion: boolean;
  generateWhisk: boolean;
  generateDreamina: boolean;
  includeMusic: boolean;
  dialogueLanguage: string;
  selectedModel: string; // Replaces sceneCount concept in UI, though we might still pass sceneCount if needed, but UI replaced it.
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