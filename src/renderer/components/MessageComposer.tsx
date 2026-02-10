import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';

interface MessageComposerProps {
    chatId: string;
    onSendMessage: (message: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ chatId, onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileUpload = () => {
        // TODO: Implement file upload
        console.log('File upload clicked');
    };

    const handleImageUpload = () => {
        // TODO: Implement image upload
        console.log('Image upload clicked');
    };

    const handleVoiceRecord = () => {
        // TODO: Implement voice recording
        console.log('Voice record clicked');
    };

    return (
        <Paper
            sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                borderRadius: 0,
                backgroundColor: 'background.paper'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <IconButton
                    color="primary"
                    onClick={handleFileUpload}
                    sx={{ mb: 0.5 }}
                >
                    <AttachFileIcon />
                </IconButton>

                <IconButton
                    color="primary"
                    onClick={handleImageUpload}
                    sx={{ mb: 0.5 }}
                >
                    <ImageIcon />
                </IconButton>

                <TextField
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'action.hover'
                        }
                    }}
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                />

                <IconButton
                    color="primary"
                    onClick={handleVoiceRecord}
                    sx={{ mb: 0.5 }}
                >
                    <MicIcon />
                </IconButton>

                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    sx={{
                        mb: 0.5,
                        backgroundColor: message.trim() ? 'primary.main' : 'transparent',
                        '&:hover': {
                            backgroundColor: message.trim() ? 'primary.dark' : 'transparent',
                        }
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};
