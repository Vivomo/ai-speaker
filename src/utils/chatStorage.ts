import { getLocal, setLocal } from "./storage";
import { ChatLogsStorageType, MessageList, Session, SessionInfo, SessionList } from '@/types';
import { SESSION_STORE } from '@/utils/constant';
import assistantStore from '@/utils/assistantStore';

const CHAT_LOGS_KEY = 'ai_chatLogs';

const getMessageStore = () => {
  let list = getLocal<ChatLogsStorageType>(CHAT_LOGS_KEY)

  if (!list) {
    list = {};
    setLocal(CHAT_LOGS_KEY, list);
  }

  return list;
}

export const getMessage = (id: string) => {
  const logs = getMessageStore ()
  return logs[id] || []
}

export const updateMessage = (id: string, logs: MessageList) => {
  const logsContainer = getMessageStore ();
  logsContainer[id] = logs;
  setLocal(CHAT_LOGS_KEY, logsContainer);
}

export const clearMessage = (id: string) => {
  const logsContainer = getMessageStore ();
  logsContainer[id] = [];
  setLocal(CHAT_LOGS_KEY, logsContainer);
}

/*** Session */
export const getSessionStore = (): SessionList => {
  let list: SessionList = getLocal(SESSION_STORE) as SessionList;
  const assistant = assistantStore.getList()[0];
  if (!list) {
    const session = {
        name: "chat",
        assistant: assistant.id,
        id: Date.now().toString(),
      },
      list = [session];
    updateMessage(session.id, []);
    setLocal(SESSION_STORE, list);
  }
  return list;
};
export const updateSessionStore = (list: SessionList) => {
  setLocal(SESSION_STORE, list);
};
export const addSession = (session: Session): SessionList => {
  const list = getSessionStore();
  list.push(session);
  updateSessionStore(list);
  return list;
};
export const getSession = (id: string): SessionInfo | null => {
  const list = getSessionStore();

  const session = list.find((session) => session.id === id);
  if (!session) return null;

  const { assistant } = session;
  let assistantInfo = assistantStore.getAssistant(assistant);
  if (!assistantInfo) {
    assistantInfo = assistantStore.getList()[0];
    updateSession(session.id, { assistant: assistantInfo.id });
  }
  return {
    ...session,
    assistant: assistantInfo,
  };
};

export const updateSession = (
  id: string,
  data: Partial<Omit<Session, "id">>,
): SessionList => {
  const list = getSessionStore();
  const index = list.findIndex((session) => session.id === id);
  if (index > -1) {
    list[index] = {
      ...list[index],
      ...data,
    };
    updateSessionStore(list);
  }
  return list;
};

export const removeSession = (id: string) => {
  const list = getSessionStore();
  const newList = list.filter((session) => session.id !== id);
  updateSessionStore(newList);
  return newList;
};