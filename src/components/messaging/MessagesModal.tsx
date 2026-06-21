import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageService, Message } from '../../services/messageService';
import { userManagementService, UserData } from '../../services/userManagementService';
import { Modal, Button, FormField, Select, Textarea, Notice, EmptyState, Tabs, type TabItem } from '../ui';
import { Inbox, Send, PencilLine, Reply } from 'lucide-react';
import { cn } from '../../lib/cn';
import { roleLabel } from '../../lib/roles';

type View = 'inbox' | 'sent' | 'compose';

const timeAgo = (ts: any) => {
  const ms = ts?.toMillis?.() ?? 0;
  if (!ms) return '';
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d`;
};

export const MessagesModal: React.FC<{ inbox: Message[]; onClose: () => void }> = ({ inbox, onClose }) => {
  const { user, displayName, role } = useAuth();
  const isAdmin = role === 'admin';

  const [view, setView] = useState<View>('inbox');
  const [sent, setSent] = useState<Message[]>([]);
  const [openMsg, setOpenMsg] = useState<Message | null>(null);

  // Compose state
  const [recipient, setRecipient] = useState<string>(isAdmin ? 'all' : 'admins');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentOk, setSentOk] = useState(false);
  const [directory, setDirectory] = useState<UserData[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    return messageService.subscribeSent(user.uid, setSent);
  }, [user?.uid]);

  useEffect(() => {
    // Admins can DM any specific user; load the active directory.
    if (isAdmin) userManagementService.getAllUsers().then((u) => setDirectory(u.filter((x) => x.status === 'active')));
  }, [isAdmin]);

  const tabs: TabItem<View>[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inbox.filter((m) => !m.read && m.toId !== 'all').length || undefined },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'compose', label: 'Compose', icon: PencilLine },
  ];

  const recipientName = useMemo(() => {
    if (recipient === 'all') return 'Everyone';
    if (recipient === 'admins') return 'Administrators';
    return directory.find((d) => d.uid === recipient)?.displayName || 'User';
  }, [recipient, directory]);

  const doSend = async (toId: string, toName: string) => {
    if (!user || !body.trim()) {
      setError('Please write a message');
      return;
    }
    setSending(true);
    setError('');
    try {
      await messageService.send({
        fromId: user.uid,
        fromName: displayName || 'User',
        fromRole: role || 'user',
        toId,
        toName,
        body: body.trim(),
      });
      setBody('');
      setSentOk(true);
      setTimeout(() => setSentOk(false), 2500);
      setOpenMsg(null);
      setView('sent');
    } catch (e) {
      console.error(e);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openInbox = (m: Message) => {
    setOpenMsg(m);
    if (m.id && !m.read && m.toId === user?.uid) messageService.markRead(m.id);
  };

  const list = view === 'inbox' ? inbox : sent;

  return (
    <Modal onClose={onClose} title="Messages" size="lg">
      <Tabs tabs={tabs} active={view} onChange={(v) => { setView(v); setOpenMsg(null); }} className="-mt-1 mb-4" />

      {sentOk && <Notice tone="success" className="mb-4">Message sent.</Notice>}

      {view === 'compose' ? (
        <div className="space-y-4">
          <FormField label="To">
            {isAdmin ? (
              <Select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                <option value="all">Everyone (broadcast)</option>
                <option value="admins">Administrators</option>
                <optgroup label="Direct message">
                  {directory.map((d) => (
                    <option key={d.uid} value={d.uid}>{d.displayName} · {roleLabel(d.role)}</option>
                  ))}
                </optgroup>
              </Select>
            ) : (
              <Select value="admins" disabled>
                <option value="admins">Administrators (support)</option>
              </Select>
            )}
          </FormField>
          <FormField label="Message">
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" />
          </FormField>
          {error && <Notice tone="danger">{error}</Notice>}
          <Button fullWidth loading={sending} onClick={() => doSend(isAdmin ? recipient : 'admins', isAdmin ? recipientName : 'Administrators')}>
            <Send className="h-4 w-4" /> Send message
          </Button>
        </div>
      ) : openMsg ? (
        <div className="space-y-4">
          <button onClick={() => setOpenMsg(null)} className="text-sm font-medium text-brand-600 hover:text-brand-700">← Back</button>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{view === 'inbox' ? openMsg.fromName : `To: ${openMsg.toName}`}</span>
              <span className="text-slate-400">{timeAgo(openMsg.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{openMsg.body}</p>
          </div>
          {view === 'inbox' && openMsg.fromId !== user?.uid && openMsg.toId !== 'all' && (
            <div className="space-y-2">
              <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Reply to ${openMsg.fromName}…`} />
              {error && <Notice tone="danger">{error}</Notice>}
              <Button loading={sending} onClick={() => doSend(openMsg.fromId, openMsg.fromName)}>
                <Reply className="h-4 w-4" /> Reply
              </Button>
            </div>
          )}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Inbox} title={view === 'inbox' ? 'No messages' : 'Nothing sent yet'} description={view === 'inbox' ? 'Messages you receive will appear here.' : 'Messages you send will appear here.'} />
      ) : (
        <div className="divide-y divide-slate-100">
          {list.map((m) => (
            <button
              key={m.id}
              onClick={() => openInbox(m)}
              className={cn('flex w-full items-start gap-3 px-1 py-3 text-left hover:bg-slate-50', view === 'inbox' && !m.read && m.toId !== 'all' && 'font-medium')}
            >
              <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', view === 'inbox' && !m.read && m.toId !== 'all' ? 'bg-brand-500' : 'bg-transparent')} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-800">
                    {view === 'inbox' ? m.fromName : `To: ${m.toName}`}
                    {m.toId === 'all' && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">broadcast</span>}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(m.createdAt)}</span>
                </span>
                <span className="block truncate text-sm text-slate-500">{m.body}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};
