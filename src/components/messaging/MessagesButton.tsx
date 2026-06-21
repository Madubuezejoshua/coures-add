import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messageService, Message } from '../../services/messageService';
import { MessagesModal } from './MessagesModal';

export const MessagesButton: React.FC = () => {
  const { user, role } = useAuth();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    return messageService.subscribeInbox(user.uid, role === 'admin', setInbox);
  }, [user?.uid, role]);

  const unread = inbox.filter((m) => !m.read && m.toId !== 'all').length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        aria-label="Messages"
      >
        <MessageSquare className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && <MessagesModal inbox={inbox} onClose={() => setOpen(false)} />}
    </>
  );
};
