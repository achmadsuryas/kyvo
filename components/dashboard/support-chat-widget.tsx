'use client';

import * as React from 'react';
import { 
  X, 
  Minus, 
  Send, 
  Loader2, 
  Headphones, 
  Clock, 
  Bot,
  User as UserIcon
} from 'lucide-react';
import { Profile, SupportTicket, SupportMessage } from '@/types';
import { getUserActiveTicket, getTicketMessages, sendSupportMessage } from '@/actions/support';
import { createClient } from '@/lib/supabase/client';
import { KyvoLogo } from '@/components/shared/kyvo-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SupportChatWidgetProps {
  profile: Profile;
}

export function SupportChatWidget({ profile }: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [ticket, setTicket] = React.useState<SupportTicket | null>(null);
  const [messages, setMessages] = React.useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch active ticket if any (without creating blank ticket)
  const loadTicketAndMessages = React.useCallback(async () => {
    setIsLoading(true);
    const res = await getUserActiveTicket(false);
    if (res.success && res.ticket) {
      setTicket(res.ticket);
      const msgs = await getTicketMessages(res.ticket.id);
      setMessages(msgs);
    } else {
      setTicket(null);
      setMessages([]);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadTicketAndMessages();
  }, [loadTicketAndMessages]);

  React.useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Set up Supabase Realtime Listener for Live Chat Updates
  React.useEffect(() => {
    if (!ticket?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`support_ticket_${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_role === 'admin') {
            if (!isOpen) {
              setHasUnread(true);
              toast.info('📩 Support team replied to your message!');
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticket.id}`,
        },
        (payload) => {
          const updatedTicket = payload.new as SupportTicket;
          setTicket(updatedTicket);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticket.id}`,
        },
        () => {
          setTicket(null);
          setMessages([]);
          toast.success('Your support ticket has been resolved and closed.');
          loadTicketAndMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticket?.id, isOpen, loadTicketAndMessages]);

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const res = await sendSupportMessage(ticket?.id || null, textToSend);
    setIsSending(false);

    if (res.success && res.message) {
      if (res.ticket) {
        setTicket(res.ticket);
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev;
        return [...prev, res.message!];
      });

      // Reload messages to catch automated bot initial response if added
      if (ticket?.id) {
        const updatedMsgs = await getTicketMessages(ticket.id);
        setMessages(updatedMsgs);
      } else {
        const freshTicketRes = await getUserActiveTicket(false);
        if (freshTicketRes.ticket) {
          setTicket(freshTicketRes.ticket);
          const msgs = await getTicketMessages(freshTicketRes.ticket.id);
          setMessages(msgs);
        }
      }

      setTimeout(scrollToBottom, 150);
    } else {
      toast.error(res.error || 'Failed to send message.');
      setInputMessage(textToSend);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* FLOATING CHAT PANEL */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] rounded-3xl border-[3.5px] border-[#111111] bg-white shadow-[8px_8px_0px_0px_#111111] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 mb-3">
          {/* Header */}
          <div className="p-4 bg-[#FFD43B] border-b-[3px] border-[#111111] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl border-2 border-[#111111] bg-white flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#111111]">
                <Headphones className="w-5 h-5 text-[#111111] stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[#111111] flex items-center gap-1.5 leading-tight">
                  Kyvo Live Support
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#111111]/80">
                  {ticket?.status === 'in_progress' ? (
                    <Badge variant="default" className="bg-[#3B82F6] text-white text-[9px] py-0 px-1.5 font-black border border-[#111111]">
                      <Clock className="w-2.5 h-2.5 mr-0.5 animate-spin" /> IN PROGRESS
                    </Badge>
                  ) : ticket?.status === 'open' ? (
                    <Badge variant="secondary" className="bg-[#FF922B] text-white text-[9px] py-0 px-1.5 font-black border border-[#111111]">
                      OPEN
                    </Badge>
                  ) : (
                    <span className="text-[10px]">Ready to help</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border-2 border-[#111111] bg-white hover:bg-[#FF4D6D] hover:text-white transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_0px_#111111]"
                title="Minimize Chat"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border-2 border-[#111111] bg-white hover:bg-[#FF4D6D] hover:text-white transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_0px_#111111]"
                title="Close Chat"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F8F9FA] space-y-3">
            <div className="rounded-2xl border-2 border-dashed border-[#111111]/30 p-3 bg-white text-center space-y-1.5 shadow-[2px_2px_0px_0px_#111111]/10">
              <div className="flex justify-center">
                <KyvoLogo size="sm" showText={true} />
              </div>
              <p className="text-xs font-black text-[#111111]">Welcome to Kyvo Support, {profile.display_name || profile.username}!</p>
              <p className="text-[11px] font-bold text-[#111111]/60">
                Need assistance or have questions? Send us a message and our support team will respond shortly.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#111111]/60" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-xs font-bold text-[#111111]/50 py-4">
                No messages yet. Send a message to start!
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      isAdmin ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg border-2 border-[#111111] shrink-0 flex items-center justify-center font-black text-[10px] shadow-[1px_1px_0px_0px_#111111] ${
                        isAdmin ? 'bg-[#A855F7] text-white' : 'bg-[#FFD43B] text-[#111111]'
                      }`}
                    >
                      {isAdmin ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[78%] rounded-2xl border-2 border-[#111111] p-3 text-xs font-bold shadow-[2px_2px_0px_0px_#111111] ${
                        isAdmin
                          ? 'bg-white text-[#111111]'
                          : 'bg-[#FF4D6D] text-white'
                      }`}
                    >
                      <div className="text-[9px] font-black uppercase opacity-75 mb-0.5">
                        {isAdmin ? 'Admin Support' : profile.display_name || profile.username}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className="text-[8px] font-black text-right mt-1 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t-[3px] border-[#111111] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border-2 border-[#111111] p-2.5 text-xs font-bold text-[#111111] outline-none shadow-[2px_2px_0px_0px_#111111]"
            />
            <Button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              size="sm"
              className="p-2.5 rounded-xl border-2 border-[#111111] bg-[#FFD43B] hover:bg-[#51CF66] text-[#111111] font-black shadow-[2px_2px_0px_0px_#111111]"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
            </Button>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON (MINIMIZED STATE) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-3.5 rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B] hover:bg-[#A855F7] hover:text-white text-[#111111] shadow-[5px_5px_0px_0px_#111111] transition-all active:scale-95 cursor-pointer flex items-center gap-2 font-black text-sm"
      >
        <div className="relative">
          <Headphones className="w-6 h-6 stroke-[2.5]" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FF4D6D] border-2 border-[#111111] animate-ping" />
          )}
        </div>
        <span className="hidden sm:inline">Live Support</span>

        {/* Unread badge dot */}
        {hasUnread && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#FF4D6D] border-2 border-[#111111] text-white text-[10px] font-black shadow-[1.5px_1.5px_0px_0px_#111111]">
            1 NEW
          </span>
        )}
      </button>
    </div>
  );
}
