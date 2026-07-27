'use client';

import * as React from 'react';
import { 
  Headphones, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  User as UserIcon, 
  Bot, 
  RefreshCw,
  Search,
  ChevronDown
} from 'lucide-react';
import { SupportTicket, SupportMessage } from '@/types';
import { getAllTicketsForAdmin, getTicketMessages, sendSupportMessage, updateTicketStatus } from '@/actions/support';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AdminSupportManagerProps {
  initialTickets: SupportTicket[];
}

const QUICK_CHAT_TEMPLATES = [
  { label: 'Greeting', text: 'Hello! How can we assist you today?' },
  { label: 'Ask Details', text: 'Could you please provide more details regarding your issue?' },
  { label: 'Investigating', text: 'We are currently investigating your request. Please hold on!' },
  { label: 'Resolved', text: 'Your issue has been resolved. Please let us know if you need any further help!' },
];

export function AdminSupportManager({ initialTickets }: AdminSupportManagerProps) {
  const [tickets, setTickets] = React.useState<SupportTicket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    initialTickets.length > 0 ? initialTickets[0].id : null
  );
  const [messages, setMessages] = React.useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter tickets by searchQuery (display_name, username, email)
  const filteredTickets = React.useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase().trim();
    return tickets.filter((t) => {
      const name = t.user?.display_name?.toLowerCase() || '';
      const uname = t.user?.username?.toLowerCase() || '';
      const email = t.user?.email?.toLowerCase() || '';
      return name.includes(query) || uname.includes(query) || email.includes(query);
    });
  }, [tickets, searchQuery]);

  // Refresh ticket list
  const refreshTickets = React.useCallback(async () => {
    const freshTickets = await getAllTicketsForAdmin();
    setTickets(freshTickets);
    if (freshTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(freshTickets[0].id);
    }
  }, [selectedTicketId]);

  // Fetch messages when selectedTicketId changes
  React.useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }

    const fetchMsgs = async () => {
      setIsLoadingMessages(true);
      const msgs = await getTicketMessages(selectedTicketId);
      setMessages(msgs);
      setIsLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    };

    fetchMsgs();
  }, [selectedTicketId]);

  // Realtime Supabase Subscription for Admin
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin_support_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          refreshTickets();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          if (newMsg.ticket_id === selectedTicketId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);
          }
          refreshTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicketId, refreshTickets]);

  // Send admin reply
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const res = await sendSupportMessage(selectedTicketId, textToSend);
    setIsSending(false);

    if (res.success && res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev;
        return [...prev, res.message!];
      });
      setTimeout(scrollToBottom, 100);
    } else {
      toast.error(res.error || 'Failed to send reply.');
      setInputMessage(textToSend);
    }
  };

  // Change ticket status
  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!selectedTicketId) return;

    setIsUpdatingStatus(true);
    const res = await updateTicketStatus(selectedTicketId, newStatus);
    setIsUpdatingStatus(false);

    if (res.success) {
      toast.success(res.message);
      if (newStatus === 'resolved') {
        // Remove ticket locally on resolution
        const remaining = tickets.filter((t) => t.id !== selectedTicketId);
        setTickets(remaining);
        setSelectedTicketId(remaining.length > 0 ? remaining[0].id : null);
      } else {
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicketId ? { ...t, status: newStatus } : t))
        );
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 space-y-6">
      <CardHeader className="px-0 pt-0 pb-4 border-b-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Headphones className="w-6 h-6 text-[#A855F7]" />
            <CardTitle className="text-2xl font-black">Live Support Center</CardTitle>
            <Badge variant="purple" className="text-xs font-black">
              {tickets.length} ACTIVE TICKETS
            </Badge>
          </div>
          <CardDescription className="text-sm font-bold text-[#111111]/70">
            Real-time live help requests from users. Manage ticket status and respond instantly.
          </CardDescription>
        </div>

        <Button
          onClick={refreshTickets}
          variant="outline"
          size="sm"
          className="gap-2 font-black border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </Button>
      </CardHeader>

      <CardContent className="px-0 pt-2">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#111111]/30 p-12 text-center space-y-3 bg-[#F8F9FA]">
            <CheckCircle2 className="w-12 h-12 text-[#51CF66] mx-auto stroke-[2]" />
            <h4 className="text-xl font-black text-[#111111]">No Active Support Tickets</h4>
            <p className="text-sm font-bold text-[#111111]/60 max-w-md mx-auto">
              All support requests have been resolved. New incoming tickets will appear here automatically in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
            {/* LEFT SIDEBAR: SEARCH & TICKET LIST */}
            <div className="lg:col-span-4 rounded-2xl border-[3px] border-[#111111] bg-[#F8F9FA] p-3 shadow-[4px_4px_0px_0px_#111111] flex flex-col gap-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, @username, email..."
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-2.5 pl-9 font-bold text-xs text-[#111111] outline-none shadow-[2px_2px_0px_0px_#111111]"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#111111]/60 stroke-[2.5]" />
              </div>

              <span className="text-xs font-black uppercase text-[#111111]/70 px-1">
                Ticket List ({filteredTickets.length})
              </span>

              {/* Scrollable Ticket List */}
              <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1">
                {filteredTickets.length === 0 ? (
                  <div className="p-4 text-center text-xs font-bold text-[#111111]/50">
                    No tickets match your search.
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isSelected = ticket.id === selectedTicketId;
                    const userName = ticket.user?.display_name || ticket.user?.username || 'User';

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={`w-full p-3 rounded-xl border-2 border-[#111111] text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FFD43B] shadow-[3px_3px_0px_0px_#111111] scale-[1.01]'
                            : 'bg-white hover:bg-[#FFD43B]/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-9 h-9 rounded-lg border-2 border-[#111111] bg-[#3B82F6] text-white font-black text-xs shrink-0 flex items-center justify-center shadow-[1px_1px_0px_0px_#111111]">
                            {ticket.user?.avatar_url ? (
                              <img src={ticket.user.avatar_url} alt={userName} className="w-full h-full object-cover rounded-md" />
                            ) : (
                              userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-black text-[#111111] truncate">{userName}</h4>
                            <p className="text-[10px] font-bold text-[#111111]/60 truncate">@{ticket.user?.username || 'user'}</p>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {ticket.status === 'in_progress' ? (
                            <Badge className="bg-[#3B82F6] text-white text-[9px] font-black border border-[#111111] px-1.5 py-0">
                              IN PROGRESS
                            </Badge>
                          ) : (
                            <Badge className="bg-[#FF922B] text-white text-[9px] font-black border border-[#111111] px-1.5 py-0">
                              OPEN
                            </Badge>
                          )}
                          <span className="text-[9px] font-extrabold text-[#111111]/50">
                            {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: ACTIVE CHAT CONVERSATION */}
            <div className="lg:col-span-8 rounded-2xl border-[3px] border-[#111111] bg-white p-4 shadow-[4px_4px_0px_0px_#111111] flex flex-col overflow-hidden">
              {activeTicket ? (
                <>
                  {/* Responsive Chat Header */}
                  <div className="pb-3 mb-3 border-b-2 border-dashed border-[#111111]/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden max-w-full">
                      <div className="w-10 h-10 rounded-xl border-2 border-[#111111] bg-[#A855F7] text-white font-black shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
                        {activeTicket.user?.avatar_url ? (
                          <img src={activeTicket.user.avatar_url} alt="User Avatar" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <UserIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-black text-sm text-[#111111] truncate">
                          {activeTicket.user?.display_name || activeTicket.user?.username || 'User Support Ticket'}
                        </h3>
                        <p className="text-xs font-bold text-[#3B82F6] truncate">@{activeTicket.user?.username} ({activeTicket.user?.email})</p>
                      </div>
                    </div>

                    {/* Neobrutalism Dropdown Menu Status Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black uppercase text-[#111111]/70">STATUS:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={isUpdatingStatus}
                            className="font-black text-xs bg-[#FFD43B] border-2 border-[#111111] rounded-xl px-3 py-2 shadow-[2px_2px_0px_0px_#111111] cursor-pointer outline-none flex items-center gap-1.5 hover:bg-white transition-colors"
                          >
                            <span>
                              {activeTicket.status === 'in_progress'
                                ? 'In Progress'
                                : activeTicket.status === 'resolved'
                                ? 'Resolved'
                                : 'Open'}
                            </span>
                            <ChevronDown className="w-4 h-4 stroke-[3]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                            Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Scrollable Messages Area */}
                  <div className="flex-1 max-h-[360px] overflow-y-auto bg-[#F8F9FA] rounded-xl border-2 border-[#111111] p-4 space-y-3">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-[#111111]/60" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-xs font-bold text-[#111111]/50 py-10">
                        No messages in this ticket yet.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAdmin = msg.sender_role === 'admin';
                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-2.5 ${
                              isAdmin ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg border-2 border-[#111111] shrink-0 flex items-center justify-center font-black text-xs shadow-[1px_1px_0px_0px_#111111] ${
                                isAdmin ? 'bg-[#A855F7] text-white' : 'bg-[#FFD43B] text-[#111111]'
                              }`}
                            >
                              {isAdmin ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                            </div>

                            <div
                              className={`max-w-[75%] rounded-2xl border-2 border-[#111111] p-3 text-xs font-bold shadow-[2px_2px_0px_0px_#111111] ${
                                isAdmin
                                  ? 'bg-[#3B82F6] text-white'
                                  : 'bg-white text-[#111111]'
                              }`}
                            >
                              <div className="text-[9px] font-black uppercase opacity-75 mb-0.5">
                                {isAdmin ? 'Admin Support' : activeTicket.user?.display_name || activeTicket.user?.username}
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

                  {/* Quick Chat Templates */}
                  <div className="pt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#111111]/70">
                      QUICK CHAT:
                    </span>
                    {QUICK_CHAT_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputMessage(tmpl.text)}
                        className="text-[10px] font-black px-2.5 py-1 rounded-lg border border-[#111111] bg-[#FFD43B]/20 hover:bg-[#FFD43B] text-[#111111] transition-all shadow-[1px_1px_0px_0px_#111111] cursor-pointer"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Admin Message Reply Form */}
                  <form onSubmit={handleSendAdminReply} className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type reply as Support Admin..."
                      className="flex-1 rounded-xl border-2 border-[#111111] p-3 text-xs font-bold text-[#111111] outline-none shadow-[2px_2px_0px_0px_#111111]"
                    />
                    <Button
                      type="submit"
                      disabled={isSending || !inputMessage.trim()}
                      className="gap-2 font-black bg-[#A855F7] text-white border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
                      <span>Send Reply</span>
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
                  <Headphones className="w-12 h-12 text-[#111111]/30 stroke-[1.5]" />
                  <p className="text-sm font-black text-[#111111]">Select a Ticket from the Left Menu</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
