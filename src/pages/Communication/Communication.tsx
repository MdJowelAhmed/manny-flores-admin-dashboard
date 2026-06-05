/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import moment from "moment";
import { Search, Send, Paperclip, ArrowLeft } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/utils/cn";

import {
  useGetChatListQuery,
  useGetMessageListQuery,
  useSendMessageMutation,
} from "@/redux/slices/super-admin/chatApi";

import { UserContext } from "@/provider/UserContext";
import { getImageUrl } from "@/utils/getImageUrl";

type TUserContext = {
  socket: any;
  user: {
    id?: string;
    _id?: string;
    name?: string;
    profile?: string | null;
  } | null;
};
type TParticipant = {
  id: string;
  name: string;
  email: string;
  profile: string | null;
  role: string;
};

type TConversation = {
  id: string;
  status: boolean;
  mode?: string;
  groupName?: string;
  participants: TParticipant[];
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: string;
  } | null;
};

function getCurrentUserId(user: TUserContext["user"]) {
  return user?.id ?? user?._id ?? "";
}

function getOtherParticipants(
  conversation: TConversation,
  currentUserId?: string,
) {
  if (!currentUserId) return conversation.participants ?? [];
  return (
    conversation.participants?.filter(
      (participant) => participant.id !== currentUserId,
    ) ?? []
  );
}

function getConversationTitle(
  conversation: TConversation,
  currentUserId?: string,
) {
  const groupName = conversation.groupName?.trim();
  if (groupName) return groupName;

  const others = getOtherParticipants(conversation, currentUserId);
  if (others.length === 1) return others[0].name;
  if (others.length > 1) {
    return others.map((participant) => participant.name).join(", ");
  }

  return conversation.participants?.[0]?.name || "Conversation";
}

function getConversationAvatar(
  conversation: TConversation,
  currentUserId?: string,
) {
  const others = getOtherParticipants(conversation, currentUserId);
  return others[0]?.profile ?? conversation.participants?.[0]?.profile ?? null;
}

function getLastMessagePreview(
  lastMessage: TConversation["lastMessage"],
) {
  const text = lastMessage?.text?.trim();
  return text || "No messages yet";
}

type TMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  resourceUrl: string | null;
  type: string;
  sender: {
    id: string;
    name: string;
    profile: string | null;
  };
};

function isImageMessage(message: TMessage) {
  if (!message.resourceUrl) return false;
  const type = message.type?.toLowerCase();
  return type === "image" || (!message.text?.trim() && !!message.resourceUrl);
}

const Communication = () => {
  const { socket, user } = useContext(UserContext) as TUserContext;
  const currentUserId = getCurrentUserId(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const chatIdParam = searchParams.get("chatId");

  const [selectedConversation, setSelectedConversation] =
    useState<TConversation | null>(null);

  const [messageInput, setMessageInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [messageList, setMessageList] = useState<TMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: chatList } = useGetChatListQuery(keyword);

  useEffect(() => {
    if (!chatIdParam) return;

    const pendingChat = (location.state as { pendingChat?: TConversation } | null)
      ?.pendingChat;

    if (pendingChat?.id === chatIdParam) {
      setSelectedConversation({
        id: pendingChat.id,
        status: pendingChat.status ?? true,
        mode: pendingChat.mode,
        groupName: pendingChat.groupName,
        participants:
          pendingChat.participants?.map((participant: any) => ({
            id: participant.user?.id ?? participant.userId ?? participant.id,
            name: participant.user?.name ?? "",
            email: participant.user?.email ?? "",
            profile: participant.user?.profile ?? null,
            role: participant.user?.role ?? "",
          })) ?? [],
        lastMessage: null,
      });
    }

    const fromList = chatList?.data?.find(
      (conversation: TConversation) => conversation.id === chatIdParam,
    );
    if (fromList) {
      setSelectedConversation(fromList);
    } else if (pendingChat?.id === chatIdParam) {
      // Keep pending chat selected until list refetch includes it.
    } else if (!pendingChat) {
      setSelectedConversation({
        id: chatIdParam,
        status: true,
        participants: [],
        lastMessage: null,
      });
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("chatId");
      return next;
    }, { replace: true });
  }, [chatIdParam, chatList?.data, location.state, setSearchParams]);

  const { data: messageData, refetch: refetchMessages } = useGetMessageListQuery(
    selectedConversation?.id,
    {
      skip: !selectedConversation?.id,
    },
  );

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessageList([]);
      return;
    }
    setMessageList(messageData?.data ?? []);
  }, [messageData, selectedConversation?.id]);

  useEffect(() => {
    setMessageInput("");
    setSelectedImage(null);
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messageList]);

  useEffect(() => {
    if (!socket || !selectedConversation?.id) return;

    const event = `getMessage::${selectedConversation.id}`;

    const handleNewMessage = (data: TMessage) => {
      setMessageList((prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    socket.on(event, handleNewMessage);

    return () => {
      socket.off(event, handleNewMessage);
    };
  }, [socket, selectedConversation]);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedConversation)
      return;

    const formData = new FormData();

    formData.append("chatId", selectedConversation.id);

    if (selectedImage) {
      formData.append("image", selectedImage);
      formData.append("type", "image");
    } else {
      formData.append("type", "text");
    }

    formData.append("text", messageInput);

    const res = await sendMessage(formData);

    //@ts-ignore
    if (res?.data?.success) {
      setMessageInput("");
      setSelectedImage(null);
      await refetchMessages();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-90px)] min-h-0 overflow-hidden rounded-2xl border bg-white"
    >
      <div className="grid grid-cols-12 h-full min-h-0">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 col-span-12 border-r bg-[#F7F7F7] flex flex-col min-h-0 overflow-hidden">
          <div className="h-[66px] bg-primary" />

          {/* Search */}
          <div className="p-3 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search conversation"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chatList?.data?.map((conversation: TConversation) => {
              const active = selectedConversation?.id === conversation?.id;
              const title = getConversationTitle(conversation, currentUserId);
              const avatar = getConversationAvatar(conversation, currentUserId);

              return (
                <button
                  key={conversation?.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left",
                    active
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-white hover:bg-gray-100",
                  )}
                >
                  <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={
                        avatar ? getImageUrl(avatar) : "/default-image.png"
                      }
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold truncate">
                        {title}
                      </p>

                      <span className="text-xs text-muted-foreground shrink-0">
                        {conversation?.lastMessage?.createdAt
                          ? moment(conversation?.lastMessage?.createdAt).format(
                              "hh:mm A",
                            )
                          : ""}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {getLastMessagePreview(conversation.lastMessage)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-8 col-span-12 flex flex-col bg-white h-full min-h-0 overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="h-[66px] shrink-0 bg-primary px-5 flex items-center">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="h-11 w-11 rounded-full overflow-hidden bg-white/20">
                    <img
                      src={
                        getConversationAvatar(selectedConversation, currentUserId)
                          ? getImageUrl(
                              getConversationAvatar(
                                selectedConversation,
                                currentUserId,
                              )!,
                            )
                          : "/default-image.png"
                      }
                      alt={getConversationTitle(
                        selectedConversation,
                        currentUserId,
                      )}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-white font-semibold text-base">
                      {getConversationTitle(
                        selectedConversation,
                        currentUserId,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto px-5 py-6 bg-[#F7F7F7] space-y-4"
              >
                {messageList?.map((message) => {
                  const isMine =
                    currentUserId === message?.senderId ||
                    user?.id === message?.senderId ||
                    user?._id === message?.senderId;

                  return (
                    <div
                      key={message?.id}
                      className={cn(
                        "flex w-full",
                        isMine ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-3 shadow-sm",
                          isMine
                            ? "bg-primary text-white rounded-t-2xl rounded-bl-2xl"
                            : "bg-white rounded-t-2xl rounded-br-2xl",
                        )}
                      >
                        {isImageMessage(message) && (
                          <img
                            src={getImageUrl(message.resourceUrl!)}
                            alt="chat attachment"
                            className="max-w-full w-full max-h-[320px] min-h-[120px] object-contain rounded-xl bg-black/5 mb-2"
                            loading="lazy"
                          />
                        )}

                        {message?.text && (
                          <p
                            className={cn(
                              "text-sm leading-relaxed",
                              isMine ? "text-white" : "text-gray-700",
                            )}
                          >
                            {message?.text}
                          </p>
                        )}

                        <div className="mt-2 flex justify-end">
                          <span
                            className={cn(
                              "text-[11px]",
                              isMine
                                ? "text-white/80"
                                : "text-muted-foreground",
                            )}
                          >
                            {moment(message?.createdAt).format("hh:mm A")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t px-4 sm:px-5 py-3 sm:py-4 bg-white">
                {selectedImage && (
                  <div className="mb-3 relative w-fit">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="preview"
                      className="h-20 w-20 rounded-lg object-cover border"
                    />

                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-11 w-11"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message"
                    className="flex-1 min-w-0 h-11 sm:h-12 rounded-full bg-white px-4"
                  />

                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#F7F7F7]">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  Select a conversation
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  Start messaging with your users
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Communication;
