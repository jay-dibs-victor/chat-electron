import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMessages, searchMessages, setSearchQuery, sendMessage, clearSearchResults } from '../store/chatSlice';
import { Box, Typography, TextField, Button, List, ListItem, Paper, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MessageComposer } from './MessageComposer';

export const MessageView = () => {
    const dispatch = useAppDispatch();
    const selectedChatId = useAppSelector((state) => state.chats.selectedChatId);
    const messages = useAppSelector((state) => state.chats.messages);
    const searchResults = useAppSelector((state) => state.chats.searchResults);
    const hasMore = useAppSelector((state) => state.chats.hasMoreMessages);
    const chats = useAppSelector((state) => state.chats.chats);
    const [query, setQuery] = useState('');

    const currentChat = chats.find(c => c.id === selectedChatId);

    useEffect(() => {
        if (selectedChatId) {
            dispatch(fetchMessages({ chatId: selectedChatId, limit: 50, offset: 0 }));
        }
    }, [selectedChatId, dispatch]);

    const handleLoadMore = () => {
        if (selectedChatId) {
            dispatch(fetchMessages({ chatId: selectedChatId, limit: 50, offset: messages.length }));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedChatId && query) {
            dispatch(searchMessages({ chatId: selectedChatId, query, limit: 50 }));
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0 && !searchResults.length) {
            scrollToBottom();
        }
    }, [messages[0]?.id, selectedChatId, searchResults.length]);

    const handleSendMessage = (text: string) => {
        if (selectedChatId) {
            dispatch(sendMessage({ chatId: selectedChatId, message: text }));
        }
    };

    if (!selectedChatId) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">Select a chat to start messaging</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            backgroundColor: 'background.default',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Paper sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                borderRadius: 0,
                flexShrink: 0,
                backgroundColor: 'background.paper',
                zIndex: 10
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" noWrap>{currentChat?.title || 'Unknown Chat'}</Typography>
                    <form onSubmit={handleSearch}>
                        <TextField
                            size="small"
                            placeholder="Search in chat..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton type="submit">
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </form>
                </Box>
            </Paper>

            {/* Message List Area */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <List sx={{ width: '100%' }}>
                    {searchResults.length === 0 && hasMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Button onClick={handleLoadMore} size="small" variant="text" color="primary">
                                Load older messages
                            </Button>
                        </Box>
                    )}
                    {searchResults.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Button onClick={() => dispatch(clearSearchResults())} size="small" variant="contained" color="secondary">
                                Clear Search ({searchResults.length} results)
                            </Button>
                        </Box>
                    )}
                    {(searchResults.length > 0 ? searchResults : [...messages].reverse()).map((msg) => (
                        <ListItem key={msg.id} sx={{ justifyContent: msg.sender === 'Me' ? 'flex-end' : 'flex-start', mb: 1, px: 0 }}>
                            <Paper sx={{
                                p: 1.5,
                                maxWidth: '75%',
                                backgroundColor: msg.sender === 'Me' ? 'primary.light' : 'background.paper',
                                color: msg.sender === 'Me' ? 'primary.contrastText' : 'text.primary',
                                border: 1,
                                borderColor: searchResults.length > 0 ? 'primary.main' : 'divider',
                                borderRadius: 2,
                                boxShadow: 1,
                                position: 'relative'
                            }}>
                                <Typography variant="caption" color={msg.sender === 'Me' ? 'inherit' : 'text.secondary'} sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                                    {msg.sender} • {new Date(msg.ts).toLocaleTimeString()}
                                    {searchResults.length > 0 && ' (Search Result)'}
                                </Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                    {msg.body}
                                </Typography>
                            </Paper>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Message Composer Area */}
            <Box sx={{
                flexShrink: 0,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper'
            }}>
                <MessageComposer
                    chatId={selectedChatId}
                    onSendMessage={handleSendMessage}
                />
            </Box>
        </Box>
    );
};
