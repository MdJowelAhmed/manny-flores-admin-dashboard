import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Paperclip, Send, CheckCheck } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  mockCustomerConversations,
  mockEmployeeConversations,
  type Conversation,
  type ConversationType,
  type Message,
} from './communicationData'
import { cn } from '@/utils/cn'

function getTimeString() {
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${mins.toString().padStart(2, '0')}${ampm}`
}

function getTimeForList() {
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${mins.toString().padStart(2, '0')}${ampm}`
}

export default function Communication() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ConversationType>('customer')
  const [customerConversations, setCustomerConversations] = useState<Conversation[]>(
    () => JSON.parse(JSON.stringify(mockCustomerConversations))
  )
  const [employeeConversations, setEmployeeConversations] = useState<Conversation[]>(
    () => JSON.parse(JSON.stringify(mockEmployeeConversations))
  )
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    () => JSON.parse(JSON.stringify(mockCustomerConversations[0]))
  )
  const [messageInput, setMessageInput] = useState('')

  const handleTabChange = (tab: ConversationType) => {
    setActiveTab(tab)
    const list = tab === 'customer' ? customerConversations : employeeConversations
    const isStillValid = list.some((c) => c.id === selectedConversation?.id)
    setSelectedConversation(isStillValid ? list.find((c) => c.id === selectedConversation!.id)! : list[0] ?? null)
  }

  const handleSendMessage = () => {
    const text = messageInput.trim()
    if (!text || !selectedConversation) return
    const now = getTimeString()
    const listTime = getTimeForList()
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text,
      timestamp: now,
      isOutgoing: true,
      isRead: true,
    }
    const updated = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: text,
      lastMessageIsFromYou: true,
      lastMessageTime: listTime,
    }
    const updateInList = (conv: Conversation) =>
      conv.id === selectedConversation.id ? updated : conv
    if (selectedConversation.type === 'customer') {
      setCustomerConversations((prev) => prev.map(updateInList))
    } else {
      setEmployeeConversations((prev) => prev.map(updateInList))
    }
    setSelectedConversation(updated)
    setMessageInput('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
    >
      {/* Left Panel - Conversation List */}
      <div className="w-[340px] min-w-[340px] flex flex-col border-r border-gray-100 bg-white">
        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ConversationType)}>
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <TabsList className="w-full h-auto p-0 bg-transparent gap-0 rounded-none border-0">
              <TabsTrigger
                value="customer"
                className={cn(
                  'flex-1 rounded-none border-b-2 border-transparent py-3 px-4 -mb-px',
                  'data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=inactive]:text-muted-foreground'
                )}
              >
                {t('communication.customer')}
              </TabsTrigger>
              <TabsTrigger
                value="employee"
                className={cn(
                  'flex-1 rounded-none border-b-2 border-transparent py-3 px-4 -mb-px',
                  'data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  'data-[state=inactive]:text-muted-foreground'
                )}
              >
                {t('communication.employee')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="customer" className="m-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={customerConversations}
              selected={selectedConversation}
              onSelect={setSelectedConversation}
              youLabel={t('communication.you')}
            />
          </TabsContent>
          <TabsContent value="employee" className="m-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={employeeConversations}
              selected={selectedConversation}
              onSelect={setSelectedConversation}
              youLabel={t('communication.you')}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <MessageList messages={selectedConversation.messages} noMessagesText={t('communication.noMessagesYet')} />
            <ChatInput
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
              placeholder={t('communication.message')}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('communication.selectConversation')}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface ConversationListProps {
  conversations: Conversation[]
  selected: Conversation | null
  onSelect: (c: Conversation) => void
  youLabel: string
}

function ConversationList({
  conversations,
  selected,
  onSelect,
  youLabel,
}: ConversationListProps) {
  return (
    <div className="overflow-y-auto scrollbar-thin flex-1">
      {conversations.map((conv) => {
        const isSelected = selected?.id === conv.id
        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
              isSelected
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : 'hover:bg-gray-50'
            )}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={conv.avatar} alt={conv.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                {conv.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'font-semibold truncate',
                  isSelected ? 'text-primary' : 'text-accent'
                )}
              >
                {conv.name}
              </p>
              <p
                className={cn(
                  'text-sm truncate',
                  isSelected ? 'text-primary/80' : 'text-muted-foreground'
                )}
              >
                {conv.lastMessageIsFromYou ? `${youLabel}: ` : ''}
                {conv.lastMessage}
              </p>
            </div>
            <span
              className={cn(
                'text-xs shrink-0',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {conv.lastMessageTime}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ChatHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={conversation.avatar} alt={conversation.name} />
        <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
          {conversation.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <p className="font-semibold text-accent">{conversation.name}</p>
    </div>
  )
}

function MessageList({ messages, noMessagesText }: { messages: Message[]; noMessagesText: string }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {noMessagesText}
        </p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.isOutgoing ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {!msg.isOutgoing && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.senderAvatar} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  {msg.senderName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                msg.isOutgoing ? 'items-end' : 'items-start'
              )}
            >
              {!msg.isOutgoing && (
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {msg.senderName}
                </p>
              )}
              <div
                className={cn(
                  ' px-4 py-4',
                  msg.isOutgoing
                    ? 'bg-secondary-foreground text-accent'
                    : 'bg-secondary-foreground text-accent',
                    msg.isOutgoing ? 'rounded-t-lg rounded-bl-lg' : 'rounded-b-lg rounded-tr-lg'
                )}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                <span className="text-xs">{msg.timestamp}</span>
                {msg.isOutgoing && (
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  placeholder?: string
}

function ChatInput({ value, onChange, onSend, placeholder = 'Message' }: ChatInputProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-accent shrink-0"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder}
        className="flex-1 rounded-full border-gray-200 h-11"
      />
      <Button
        type="button"
        onClick={onSend}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 rounded-full"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
