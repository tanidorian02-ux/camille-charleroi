export type Language = 'fr' | 'nl' | 'en'
export type ChatMode = 'vocal' | 'chat'
export interface Message {
  role: 'user' | 'bot'
  text: string
}
