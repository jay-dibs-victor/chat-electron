import React, { useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchChats, selectChat } from '../store/chatSlice';
import { ListItem, ListItemButton, ListItemText, Typography, Badge, Box } from '@mui/material';

export const ChatList = () => {
    const dispatch = useAppDispatch();
    const chats = useAppSelector((state) => state.chats.chats);
    const selectedChatId = useAppSelector((state) => state.chats.selectedChatId);

    useEffect(() => {
        dispatch(fetchChats({ limit: 200, offset: 0 }));
    }, [dispatch]);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const chat = chats[index];
        if (!chat) return null;

        return (
            <ListItem style={style} key={chat.id} component="div" disablePadding>
                <ListItemButton
                    selected={selectedChatId === chat.id}
                    onClick={() => {
                        dispatch(selectChat(chat.id));
                        (window as any).electron.ipcRenderer.invoke('mark-as-read', chat.id);
                    }}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '&.Mui-selected': {
                            backgroundColor: 'action.selected',
                        },
                        '&.Mui-selected:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <ListItemText
                        primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" noWrap sx={{ fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal' }}>
                                    {chat.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        }
                        secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '80%' }}>
                                    Tap to view messages
                                </Typography>
                                {chat.unreadCount > 0 && (
                                    <Badge badgeContent={chat.unreadCount} color="primary" sx={{ mr: 1 }} />
                                )}
                            </Box>
                        }
                    />
                </ListItemButton>
            </ListItem>
        );
    };



    return (
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <List
                height={800} // This should ideally be dynamic
                itemCount={chats.length}
                itemSize={72}
                width="100%"
            >
                {Row}
            </List>
        </Box>
    );
};
