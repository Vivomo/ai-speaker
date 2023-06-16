import React, { useEffect, useState, KeyboardEvent } from 'react';
import { getCompletion } from '@/utils/getCompletion';
import { ActionIcon, Textarea, Button } from '@mantine/core';
import { MessageList } from '@/types';
import { clearChatLogs, getChatLogs, updateChatLogs } from '@/utils/chatStorage';
import { IconSend, IconEraser } from "@tabler/icons-react";
import clsx from "clsx";

const LOCAL_KEY = 'ai_demo'

const Chat = () => {
  const [prompt, setPrompt] = useState('')

  const [completion, setCompletion] = useState('')
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState<MessageList>([]);

  const setChatLogs = (logs: MessageList) => {
    setChatList(logs)
    updateChatLogs(LOCAL_KEY, logs)
  }

  const onClear = () => {
    clearChatLogs(LOCAL_KEY);
    setChatList([]);
  };

  const onKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.keyCode === 13 && !evt.shiftKey) {
      evt.preventDefault();
      getAIResp();
    }
  };

  const getAIResp = async () => {
    const list = [
      ...chatList,
      {
        role: 'user',
        content: prompt
      }
    ];
    setChatLogs(list)
    const resp = await getCompletion({
      prompt,
      history: chatList.slice(-4),
    })
    console.log(resp)
    // @ts-ignore
    setCompletion(resp.content)
    setChatLogs([
      ...list,
      {
        role: 'assistant',
        content: resp.content
      }
    ])
    setPrompt('')

  }

  useEffect(() => {
    const logs = getChatLogs(LOCAL_KEY)
    setChatList(logs)
  }, [])

  return (
    <div className="h-screen flex flex-col items-center justify-end">
      <div
        className={clsx([
          "flex-col",
          "h-[calc(100vh-10rem)]",
          "w-full",
          "overflow-y-auto",
          "rounded-sm",
          "px-8",
        ])}
      >
        {chatList.map((item, idx) => (
          <div
            key={`${item.role}-${idx}`}
            className={clsx(
              {
                flex: item.role === "user",
                "flex-col": item.role === "user",
                "items-end": item.role === "user",
              },
              "mt-4",
            )}
          >
            <div>{item.role}</div>
            <div
              className={clsx(
                "rounded-md",
                "shadow-md",
                "px-4",
                "py-2",
                "mt-1",
                "w-full",
                "max-w-4xl",
              )}
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center w-3/5">
        <ActionIcon
          className="mr-2"
          disabled={loading}
          onClick={() => onClear()}
        >
          <IconEraser></IconEraser>
        </ActionIcon>
        <Textarea
          placeholder="Enter your prompt"
          className="w-full mr-5"
          value={prompt}
          onKeyDown={(evt) => onKeyDown(evt)}
          onChange={(e) => {
            setPrompt(e.target.value)
          }}
        />
        <ActionIcon
          className="ml-2"
          loading={loading}
          onClick={() => getAIResp()}
        >
          <IconSend></IconSend>
        </ActionIcon>
      </div>
    </div>
  );
};

export default Chat;