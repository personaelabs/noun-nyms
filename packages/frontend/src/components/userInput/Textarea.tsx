import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface TextAreaProps {
  value: string;
  onChangeHandler: (newVal: string) => void;
  placeholder: string;
  minRows: number;
  setCursorPosition: ({}: { x: number; y: number }) => void;
  findCursor: boolean;
}

export const Textarea = (props: TextAreaProps) => {
  const { value, onChangeHandler, placeholder, minRows, setCursorPosition, findCursor } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // used to calculate the width of the text content
  const hiddenDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (findCursor) {
      if (hiddenDivRef.current && textareaRef.current) {
        // put text into hidden div to calculate its dimensions
        const hiddenDiv = hiddenDivRef.current;
        hiddenDiv.innerText = value;

        // assign dimensions to cursor position
        const textareaRect = textareaRef.current.getBoundingClientRect();
        const cursorX = textareaRect.left + hiddenDiv.offsetWidth;
        const cursorY = textareaRect.top + hiddenDiv.offsetHeight + 24;
        setCursorPosition({ x: cursorX, y: cursorY });
      }
    }
  }, [findCursor, value, setCursorPosition]);

  return (
    <div className="w-full relative">
      <TextareaAutosize
        className="py-4 px-6 resize-none outline-none w-full"
        ref={textareaRef}
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={(evt) => onChangeHandler(evt.target.value)}
      />
      <div className="absolute invisible" ref={hiddenDivRef} />
    </div>
  );
};
