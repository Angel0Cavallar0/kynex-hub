export interface EvolutionChatPayload {
  id?: string;
  chatId?: string;
  remoteJid?: string;
  name?: string;
  formattedName?: string;
  pushName?: string;
  shortName?: string;
  unreadCount?: number;
  unread?: number;
  notRead?: number;
  pictureUrl?: string;
  profilePictureUrl?: string;
  profilePicUrl?: string;
  imageUrl?: string;
  photo?: string;
  lastMessage?: EvolutionMessagePayload;
  messages?: EvolutionMessagePayload[];
}

export interface EvolutionMessagePayload {
  id?: string;
  key?: { id?: string; remoteJid?: string };
  message?: { conversation?: string; extendedTextMessage?: { text?: string } };
  body?: string;
  text?: string;
  messageContent?: string;
  content?: string;
  fromMe?: boolean;
  author?: string;
  senderName?: string;
  pushName?: string;
  participant?: string;
  remoteJid?: string;
  chatId?: string;
  timestamp?: number;
  messageTimestamp?: number;
  sendAt?: number;
  type?: string;
}

export interface EvolutionChatSummary {
  id: string;
  name: string;
  unreadCount: number;
  pictureUrl?: string;
  lastMessage?: EvolutionMessageSummary;
}

export interface EvolutionMessageSummary {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  senderName?: string;
}

export interface EvolutionMessage {
  id: string;
  chatId: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  senderName?: string;
  type?: string;
}
