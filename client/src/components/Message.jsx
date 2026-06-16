import React, { useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import moment from 'moment';
import Markdown from 'react-markdown';
import Prism from 'prismjs';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

import 'prismjs/themes/prism-tomorrow.css';

function Message({ message }) {
  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      Prism.highlightAllUnder(messageRef.current);
    }
  }, [message.content]);

  return (
    <div>
      {/* USER MESSAGE */}
      {message.role === 'user' ? (
        <div className='flex items-start justify-end my-4 gap-2 w-full'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl'>
            <p className='text-sm dark:text-primary whitespace-pre-wrap break-words overflow-hidden'>
              {message.content || ''}
            </p>

            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>

          <img
            src={assets.user_icon}
            className='w-8 h-8 rounded-full object-cover'
            alt="User"
          />
        </div>
      ) : (
        /* BOT MESSAGE */
        <div className='flex justify-start my-4 w-full'>
          <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20 dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md overflow-hidden'>

            {message.isImage ? (
              <img
                src={message.content}
                className='w-full max-w-md mt-2 rounded-md'
                alt="Generated"
              />
            ) : (
              <div
                ref={messageRef}
                className='text-sm dark:text-primary reset-tw prose prose-invert max-w-none break-words overflow-hidden'
              >
                <Markdown>{message.content || ''}</Markdown>
              </div>
            )}

            <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;