/**
 * @ Description: 聊天室状态管理
 */

import React from 'react';
import { MESSAGE_TYPE } from '@im/helper';

// 消息模型
export interface Message {
  id: string;
  type: MESSAGE_TYPE;
  userId?: string;
  isOwner?: boolean;
  content?: {
    text?: string;
    image?: string;
  };
}

// 用户模型
export interface Member {
  id: string;
  name?: string;
  avatar?: string;
}

export enum Type {
  INSERT_MESSAGE,
  INSERT_SOCKET,
  INSERT_MEMBER,
  REMOVE_MEMBER,
  UPDATE_ACTIVE_TOOL,
  UPDATE_CURRENT_USER_ID,
}

// 工具栏模式，如表情模式
export enum ActiveTool {
  EXTRA,
  NULL,
}

// 聊天室共享状态
interface State {
  socket: SocketIOClient.Socket | null; // 当前连接的 socket
  messages: Message[]; // 消息列表，包括用户发送的文本消息、系统消息
  members: { [propName: string]: Member }; // 聊天室用户列表，范式化
  activeTool: ActiveTool;
  currentUserId: string;
}

interface InsertMessage {
  type: Type.INSERT_MESSAGE;
  payload: Message;
}

interface InsertSocket {
  type: Type.INSERT_SOCKET;
  payload: SocketIOClient.Socket;
}

interface InsertMember {
  type: Type.INSERT_MEMBER;
  payload: Member;
}

interface RemoveMember {
  type: Type.REMOVE_MEMBER;
  payload: Member;
}

interface UpdateActiveTool {
  type: Type.UPDATE_ACTIVE_TOOL;
  payload: ActiveTool;
}

interface UpdateCurrentUserId {
  type: Type.UPDATE_CURRENT_USER_ID;
  payload: string;
}

export type Action =
  | InsertMessage
  | InsertSocket
  | InsertMember
  | RemoveMember
  | UpdateActiveTool
  | UpdateCurrentUserId;

export const initialState: State = {
  messages: [],
  members: {},
  socket: null,
  activeTool: ActiveTool.NULL,
  currentUserId: '',
};

export const reducer = (state: State = initialState, action: Action): State => {
  const { type, payload } = action;
  switch (type) {
    case Type.INSERT_MESSAGE: {
      return { ...state, messages: [...state.messages, payload as Message] };
    }
    case Type.INSERT_SOCKET: {
      return { ...state, socket: payload as SocketIOClient.Socket };
    }
    case Type.INSERT_MEMBER: {
      const member = payload as Member;
      return { ...state, members: { ...state.members, [member.id]: member } };
    }
    case Type.UPDATE_ACTIVE_TOOL: {
      return { ...state, activeTool: payload as ActiveTool };
    }
    case Type.UPDATE_CURRENT_USER_ID: {
      return { ...state, currentUserId: payload as string };
    }
    case Type.REMOVE_MEMBER: {
      const finalMembers = { ...state.members };
      delete finalMembers.id;
      return { ...state, members: finalMembers };
    }
    default:
      throw new Error();
  }
};

export const ChatContext = React.createContext<{
  state: typeof initialState;
  dispatch: (action: Action) => void;
}>({
  state: initialState,
  dispatch: () => {},
});

export const useChatStore = () => React.useContext(ChatContext);

export function ChatProvider(props: any) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <ChatContext.Provider value={value}>{props.children}</ChatContext.Provider>;
}
