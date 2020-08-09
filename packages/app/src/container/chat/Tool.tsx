/**
 * @ Description: 底部工具栏，如发送语音，文本，标签等
 */

import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Button, InputBase, makeStyles, useTheme, fade } from '@im/component';
import { ControlPoint, Mic } from '@material-ui/icons';
import { MESSAGE_TYPE } from '@im/helper';
import Extra from './Extra';
import { useChatStore, Type, ActiveTool } from './store';

const useStyles = makeStyles(() => ({
  inputRoot: {
    color: 'inherit',
    lineHeight: 1.43,
  },
}));

function ContainerTool() {
  const classes = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useChatStore();

  // 准备发送的消息
  const [message, setMessage] = React.useState('');
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (state.socket) {
      state.socket.emit('new message', { message, type: MESSAGE_TYPE.TEXT_SIMPLE });

      // 当前用户的消息直接存入消息列表
      dispatch({
        type: Type.INSERT_MESSAGE,
        payload: {
          id: `message-${state.messages.length}`,
          userId: state.currentUserId,
          isOwner: true,
          type: MESSAGE_TYPE.TEXT_SIMPLE,
          content: { text: message },
        },
      });
      setMessage('');
    }
  };

  // 输入框聚焦时还原工具栏最初状态
  const handleMessageInputFocus = () => {
    dispatch({ type: Type.UPDATE_ACTIVE_TOOL, payload: ActiveTool.NULL });
  };

  // 打开扩展工具
  const handleOpenTool = () => {
    dispatch({ type: Type.UPDATE_ACTIVE_TOOL, payload: ActiveTool.EXTRA });
  };

  const renderSend = () => {
    // 输入框中有文本时显示发送按钮
    if (message.trim().length !== 0) {
      return (
        <Box pl={1} my={1}>
          <Button variant="contained" size="small" onClick={handleSend}>
            发送
          </Button>
        </Box>
      );
    }
    return (
      <IconButton edge="end" color="inherit" aria-label="open more tool" onClick={handleOpenTool}>
        <ControlPoint />
      </IconButton>
    );
  };

  return (
    <Box flexShrink={0}>
      <AppBar position="static" component="footer" elevation={1}>
        <Toolbar>
          <Box flexGrow={1} display="flex" alignItems="flex-end">
            <IconButton edge="start" color="inherit" aria-label="send voice">
              <Mic />
            </IconButton>
            <Box
              flexGrow={1}
              px={1}
              my={1}
              borderRadius={theme.shape.borderRadius}
              bgcolor={fade(theme.palette.common.white, 0.15)}
            >
              <InputBase
                value={message}
                onChange={handleMessageChange}
                onFocus={handleMessageInputFocus}
                rowsMax={5}
                classes={{
                  root: classes.inputRoot,
                }}
                inputProps={{ 'aria-label': 'message input' }}
                fullWidth
                multiline
              />
            </Box>
            {renderSend()}
          </Box>
        </Toolbar>
      </AppBar>
      <Extra visible={state.activeTool === ActiveTool.EXTRA} />
    </Box>
  );
}

export default ContainerTool;
