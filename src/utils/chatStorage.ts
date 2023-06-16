import { getLocal, setLocal } from "./storage";
import { ChatLogsStorageType, MessageList } from '@/types';

const CHAT_LOGS_KEY = 'ai_chatLogs';

const getChatLogsContainer = () => {
  let list = getLocal<ChatLogsStorageType>(CHAT_LOGS_KEY)

  if (!list) {
    list = {};
    setLocal(CHAT_LOGS_KEY, list);
  }

  return list;
}

export const getChatLogs = (id: string) => {
  const logs = getChatLogsContainer()
  return logs[id] || []
}

export const updateChatLogs = (id: string, logs: MessageList) => {
  const logsContainer = getChatLogsContainer();
  logsContainer[id] = logs;
  setLocal(CHAT_LOGS_KEY, logsContainer);
}

export const clearChatLogs = (id: string) => {
  const logsContainer = getChatLogsContainer();
  logsContainer[id] = [];
  setLocal(CHAT_LOGS_KEY, logsContainer);
}