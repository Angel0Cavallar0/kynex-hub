import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";

import {
  EvolutionChatSummary,
  EvolutionMessage,
} from "@/integrations/evolution/types";
import {
  isEvolutionConfigured,
  listEvolutionChats,
  listEvolutionMessages,
  sendEvolutionMessage,
} from "@/integrations/evolution/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeTimestamp(timestamp: number) {
  return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
}

function formatTimestamp(timestamp: number) {
  try {
    return format(new Date(normalizeTimestamp(timestamp)), "dd/MM/yyyy HH:mm", {
      locale: ptBR,
    });
  } catch (error) {
    return "";
  }
}

function ChatListPlaceholder() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatListItem({
  chat,
  isActive,
  onClick,
}: {
  chat: EvolutionChatSummary;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-muted"
      }`}
    >
      <Avatar>
        {chat.pictureUrl && <AvatarImage src={chat.pictureUrl} alt={chat.name} />}
        <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{chat.name}</span>
          {chat.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {chat.lastMessage?.senderName
            ? `${chat.lastMessage.senderName}: ${chat.lastMessage.body}`
            : chat.lastMessage?.body}
        </p>
      </div>
      {chat.unreadCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message }: { message: EvolutionMessage }) {
  const isMine = message.fromMe;
  const senderLabel = isMine ? "Você" : message.senderName ?? "Contato";

  return (
    <div
      className={`flex flex-col max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${
        isMine
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      <span className={`text-xs font-semibold ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {senderLabel}
      </span>
      <span className="whitespace-pre-wrap break-words mt-1">{message.body}</span>
      <span className={`mt-2 text-[10px] text-right ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {formatTimestamp(message.timestamp)}
      </span>
    </div>
  );
}

export default function Whatsapp() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const chatsQuery = useQuery({
    queryKey: ["evolution", "chats"],
    queryFn: listEvolutionChats,
    enabled: isEvolutionConfigured,
    refetchInterval: 15000,
  });

  const messagesQuery = useQuery({
    queryKey: ["evolution", "messages", selectedChat],
    queryFn: () => listEvolutionMessages(selectedChat ?? ""),
    enabled: isEvolutionConfigured && Boolean(selectedChat),
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendEvolutionMessage,
    onSuccess: async (_, variables) => {
      setMessageDraft("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["evolution", "messages", variables.chatId] }),
        queryClient.invalidateQueries({ queryKey: ["evolution", "chats"] }),
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Não foi possível enviar a mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!selectedChat && chatsQuery.data && chatsQuery.data.length > 0) {
      setSelectedChat(chatsQuery.data[0].id);
    }
  }, [selectedChat, chatsQuery.data]);

  const filteredChats = useMemo(() => {
    if (!chatsQuery.data) return [];
    if (!searchTerm) return chatsQuery.data;
    const lower = searchTerm.toLowerCase();
    return chatsQuery.data.filter((chat) => chat.name.toLowerCase().includes(lower));
  }, [chatsQuery.data, searchTerm]);

  const selectedMessages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);

  const selectedChatData = useMemo(() => {
    if (!selectedChat) return undefined;
    return chatsQuery.data?.find((chat) => chat.id === selectedChat);
  }, [selectedChat, chatsQuery.data]);

  const handleSendMessage = () => {
    if (!selectedChat || !messageDraft.trim()) return;
    sendMessageMutation.mutate({ chatId: selectedChat, message: messageDraft.trim() });
  };

  if (!isEvolutionConfigured) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold mb-3">Configuração do WhatsApp</h1>
          <p className="text-muted-foreground">
            Para utilizar a integração com o WhatsApp através da Evolution API, informe as variáveis de ambiente
            <code className="mx-1 rounded bg-muted px-1 py-0.5">VITE_EVOLUTION_API_URL</code>,
            <code className="mx-1 rounded bg-muted px-1 py-0.5">VITE_EVOLUTION_INSTANCE_ID</code> e
            <code className="mx-1 rounded bg-muted px-1 py-0.5">VITE_EVOLUTION_API_KEY</code>. Após configurar, atualize a página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] bg-background">
      <aside className="flex w-80 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <Input
            placeholder="Buscar conversas"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <ScrollArea className="flex-1 p-4">
          {chatsQuery.isLoading ? (
            <ChatListPlaceholder />
          ) : chatsQuery.isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar as conversas. Verifique a conexão com a Evolution API.
            </p>
          ) : filteredChats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Nenhuma conversa encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={selectedChat === chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
      <section className="flex-1 flex flex-col">
        <header className="border-b px-6 py-4">
          {selectedChatData ? (
            <div>
              <h2 className="text-lg font-semibold">{selectedChatData.name}</h2>
              {selectedChatData.lastMessage && (
                <p className="text-xs text-muted-foreground">
                  Última mensagem em {formatTimestamp(selectedChatData.lastMessage.timestamp)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma conversa para começar.</p>
          )}
        </header>
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="flex flex-col gap-4">
            {messagesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className={`h-16 w-3/4 ${index % 2 === 0 ? "ml-auto" : ""}`} />
                ))}
              </div>
            ) : messagesQuery.isError ? (
              <p className="text-sm text-destructive text-center mt-8">
                Não foi possível carregar as mensagens desta conversa.
              </p>
            ) : selectedMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-8">
                Nenhuma mensagem encontrada para esta conversa.
              </p>
            ) : (
              selectedMessages
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((message) => <MessageBubble key={message.id} message={message} />)
            )}
          </div>
        </ScrollArea>
        <footer className="border-t px-6 py-4">
          <div className="flex items-end gap-3">
            <Textarea
              placeholder="Digite uma mensagem"
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!selectedChat || sendMessageMutation.isPending}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedChat || !messageDraft.trim() || sendMessageMutation.isPending}
              className="self-stretch"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
