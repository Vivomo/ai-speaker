// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  content: string
}

import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { MessageList } from '@/types';
import { NextRequest } from 'next/server';
import { MAX_TOKEN, TEAMPERATURE } from '@/utils/constant';

type StreamPayload = {
  model: string;
  messages: MessageList;
  temperature?: number;
  stream: boolean;
  max_tokens?: number;
};

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
// ) {
//
//   const { prompt, history = [], options = {} } = await req.body
//
//   const data = {
//     model: 'gpt-3.5-turbo',
//     messages: [
//       {
//         role: 'system',
//         content: 'you are a assistant'
//       },
//       ...history,
//       {
//         role: 'user',
//         content: prompt
//       },
//     ],
//     ...options
//   }
//   // const resp = await fetch('https://api.openai.com/v1/chat/completions', {
//   //   headers: {
//   //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//   //     'Content-Type': 'application/json'
//   //   },
//   //   method: 'POST',
//   //   body: JSON.stringify(data)
//   // })
//   //
//   // const json = await resp.json()
//
//   // res.status(200).json(json)
//   res.status(200).json({ content: '1234'})
// }



export default async function handler(req: NextRequest) {
  const { prompt, history = [], options = {} } = await req.json();
  const { max_tokens, temperature, prompt: systemPrompt } = options;
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
    temperature: +temperature || TEAMPERATURE,
    max_tokens: max_tokens || MAX_TOKEN,
  };

  const stream = await requestStream(data);
  return new Response(stream);
}

const requestStream = async (payload: StreamPayload) => {
  const counter = 0;
  const resp = await fetch(`${process.env.END_POINT}/v1/chat/completions`, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  return createStream(resp, counter);
};

const createStream = (response: Response, counter: number) => {
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0]?.delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const q = encoder.encode(text);
            controller.enqueue(q);
            counter++;
          } catch (error) {}
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
};

export const config = {
  runtime: "edge",
};