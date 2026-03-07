"use client";

import Navbar from "@/components/custom/navbar";
import { client } from "@/lib/elysia-client";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const fetchConversations = async () => {
    const { data } = await client.conversations.get();
    return data;
  };

  const { data } = useQuery({
    queryKey: ["get-conversations"],
    queryFn: fetchConversations,
  });

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center">
        Hello
        <ul>
          {data?.data.map((convo, index) => (
            <li key={index}>{convo.id}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
