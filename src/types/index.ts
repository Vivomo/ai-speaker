export type Message = {
  role: string;
  content: string;
}

export type MessageList = Message[];

export type ChatLogsStorageType = {
  [key: string]: MessageList;
}