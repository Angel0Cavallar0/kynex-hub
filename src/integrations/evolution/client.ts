import {
  EvolutionChatPayload,
  EvolutionChatSummary,
  EvolutionMessage,
  EvolutionMessagePayload,
  EvolutionMessageSummary,
} from "./types";

const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const EVOLUTION_INSTANCE_ID = import.meta.env.VITE_EVOLUTION_INSTANCE_ID;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

export const isEvolutionConfigured = Boolean(
  EVOLUTION_API_URL && EVOLUTION_INSTANCE_ID && EVOLUTION_API_KEY,
);

const baseUrl = EVOLUTION_API_URL
  ? `${EVOLUTION_API_URL.replace(/\/$/, "")}/instances/${EVOLUTION_INSTANCE_ID}`
  : "";

interface EvolutionListResponse<T> {
  data?: T[];
  chats?: T[];
  messages?: T[];
  items?: T[];
  results?: T[];
}

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  accept: "application/json",
};

if (EVOLUTION_API_KEY) {
  defaultHeaders.apikey = EVOLUTION_API_KEY;
  defaultHeaders.Authorization = `Bearer ${EVOLUTION_API_KEY}`;
}

async function evolutionFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isEvolutionConfigured) {
    throw new Error(
      "Evolution API environment variables are not configured. Please set VITE_EVOLUTION_API_URL, VITE_EVOLUTION_INSTANCE_ID and VITE_EVOLUTION_API_KEY.",
    );
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Evolution API request failed");
  }

  return response.json() as Promise<T>;
}

function getMessageBody(payload: EvolutionMessagePayload): string {
  if (payload.body) return payload.body;
  if (payload.text) return payload.text;
  if (payload.content) return payload.content;
  if (payload.messageContent) return payload.messageContent;
  const conversation = payload.message?.conversation;
  if (conversation) return conversation;
  const extended = payload.message?.extendedTextMessage?.text;
  if (extended) return extended;
  return "";
}

function getMessageId(payload: EvolutionMessagePayload): string {
  return (
    payload.id ||
    payload.key?.id ||
    `${payload.remoteJid ?? payload.chatId ?? "unknown"}-${payload.timestamp ?? Date.now()}`
  );
}

function normalizeMessage(payload: EvolutionMessagePayload): EvolutionMessage {
  const body = getMessageBody(payload);
  const timestampValue =
    payload.timestamp ?? payload.messageTimestamp ?? payload.sendAt ?? Date.now();
  const timestamp = timestampValue < 1_000_000_000_000
    ? timestampValue * 1000
    : timestampValue;

  return {
    id: getMessageId(payload),
    chatId: payload.remoteJid ?? payload.chatId ?? payload.key?.remoteJid ?? "",
    body,
    fromMe: Boolean(payload.fromMe || payload.author === "me"),
    timestamp,
    senderName:
      payload.senderName ||
      payload.pushName ||
      payload.author ||
      payload.participant ||
      undefined,
    type: payload.type,
  };
}

function normalizeMessageSummary(
  payload?: EvolutionMessagePayload,
): EvolutionMessageSummary | undefined {
  if (!payload) return undefined;
  const normalized = normalizeMessage(payload);
  return {
    id: normalized.id,
    body: normalized.body,
    fromMe: normalized.fromMe,
    timestamp: normalized.timestamp,
    senderName: normalized.senderName,
  };
}

function normalizeChat(payload: EvolutionChatPayload): EvolutionChatSummary {
  const id =
    payload.id || payload.chatId || payload.remoteJid ||
    (payload.lastMessage?.remoteJid ?? "");
  const messages = payload.messages ?? [];
  const fallbackMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const name =
    payload.name ||
    payload.formattedName ||
    payload.pushName ||
    payload.shortName ||
    id.replace(/@.*$/, "") ||
    "Contato";

  return {
    id,
    name,
    unreadCount: payload.unreadCount ?? payload.unread ?? payload.notRead ?? 0,
    pictureUrl:
      payload.pictureUrl ||
      payload.profilePictureUrl ||
      payload.profilePicUrl ||
      payload.imageUrl ||
      payload.photo,
    lastMessage: normalizeMessageSummary(
      payload.lastMessage || fallbackMessage,
    ),
  };
}

export async function listEvolutionChats(): Promise<EvolutionChatSummary[]> {
  const response = await evolutionFetch<EvolutionListResponse<EvolutionChatPayload>>(
    "/chats",
  );

  const items =
    response.chats ||
    response.data ||
    response.items ||
    response.results ||
    [];

  return items
    .map(normalizeChat)
    .filter((chat) => Boolean(chat.id && chat.name));
}

export async function listEvolutionMessages(
  chatId: string,
): Promise<EvolutionMessage[]> {
  const response = await evolutionFetch<EvolutionListResponse<EvolutionMessagePayload>>(
    `/chats/${encodeURIComponent(chatId)}/messages`,
  );

  const items =
    response.messages ||
    response.data ||
    response.items ||
    response.results ||
    [];

  return items.map(normalizeMessage).filter((message) => Boolean(message.id));
}

interface SendMessageInput {
  chatId: string;
  message: string;
}

export async function sendEvolutionMessage(input: SendMessageInput) {
  const { chatId, message } = input;
  const payload: Record<string, unknown> = {
    message,
  };

  if (chatId.includes("@")) {
    payload.chatId = chatId;
  } else {
    payload.number = chatId;
  }

  return evolutionFetch("/messages/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
