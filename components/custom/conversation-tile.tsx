"use client";
import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { client } from "@/lib/elysia-client";
import { Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

const fetchConversations = async () => {
  const { data: conversationList } = await client.conversations.get();
  return conversationList;
};

export default function ConversationTile() {
  const queryClient = useQueryClient();
  const { data, status } = useQuery({
    queryKey: ["get-convo"],
    queryFn: fetchConversations,
    staleTime: Infinity,
    retry: false,
  });

  const deleteConvo = async (convoId: string) => {
    await client.deleteconvo({ conversationId: convoId }).post();
    queryClient.invalidateQueries({
      queryKey: ["get-convo"],
    });
  };
  if (status === "pending") return <ConversationTileSkeleton />;

  if (status === "error")
    return <p>{"No active conversations to fetch or something went wrong"}</p>;

  let counter = 1;
  return (
    <div className="mt-3">
      <ul className="grid w-full grid-cols-1 gap-1 md:w-4/5 md:grid-cols-2">
        {data?.data.map((convo, index) => (
          <li
            key={index}
            className="mb-2 border-2 border-neutral-500 p-4 hover:shadow-md"
          >
            <Link href={`/dashboard/conversation/${convo.id}`}>
              <div>
                <p>{`Conversation ${counter++}`}</p>
              </div>
            </Link>
            {/* <Button className={} onClick={() => deleteConvo(convo.id)}>
              <Trash2Icon size={5} />
            </Button> */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConversationTileSkeleton() {
  return (
    <div className="mt-3">
      <ul className="grid w-full grid-cols-1 gap-2 md:w-4/5 md:grid-cols-2 md:gap-1">
        <Skeleton className="h-15 w-full md:w-100" />
        <Skeleton className="h-15 w-full md:w-100" />
      </ul>
    </div>
  );
}
