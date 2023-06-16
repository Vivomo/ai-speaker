import { Message } from '@/types';


type Props = {
  prompt: string;
  history?: Message[];
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
}

export const getCompletion = async (params: Props) => {
  const resp = await fetch('api/chat', {
    headers: {
      "Content-Type": "application/json"
    },
    method: 'POST',
    body: JSON.stringify(params)
  })
  if (!resp.ok) {
    throw new Error(resp.statusText)
  }
  const data = resp.json();
  return data;
}