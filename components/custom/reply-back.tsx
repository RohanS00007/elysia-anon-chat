"use client";
import { Controller } from "react-hook-form";
import { Field, FieldDescription, FieldError } from "../ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  // InputGroup,
  // InputGroupAddon,
  // InputGroupButton,
  InputGroupTextarea,
} from "../ui/input-group";

import * as z from "zod";
import { toast } from "sonner";
import { client } from "@/lib/elysia-client";
import { useRef } from "react";

const formSchema = z.object({
  messageContent: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(500, "Message content must be at most 500 characters."),
});

export default function ReplyBack({
  conversationId,
}: {
  conversationId: string;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      messageContent: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      inputRef.current?.focus();
      await client["reply-message"].post({
        conversationId: conversationId,
        messageContent: data.messageContent,
      });

      queryClient.invalidateQueries({
        queryKey: ["get-messages", conversationId],
      });
    } catch (error) {
      console.log(error);
      toast.error("Error sending message");
    } finally {
      inputRef.current?.focus();
      form.reset();
      inputRef.current?.focus();
    }
  }

  return (
    <div className="absolute right-0 bottom-0 left-0 w-full px-4 py-3">
      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="messageContent"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <div className="relative flex items-center justify-center gap-1">
                <InputGroupTextarea
                  {...field}
                  id="textarea-message"
                  className="max-h-24 flex-1 resize-none scroll-py-3 overflow-y-auto rounded-md bg-gray-900 pt-4 pr-15 pl-4 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  aria-invalid={fieldState.invalid}
                  placeholder="Type a message..."
                  rows={1}
                  ref={inputRef}
                />
                <button
                  type="submit"
                  form="form-rhf-demo"
                  disabled={!field.value.trim()}
                  className="absolute right-3 float-right flex h-10 w-10 items-center justify-center rounded-md bg-green-600 text-white [clip-path:circle(50%)] [shape-outside:circle(70%)] hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  ➤
                </button>
              </div>
              <FieldDescription></FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>
    </div>
  );
}
