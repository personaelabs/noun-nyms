import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface TextAreaProps {
  value: string;
  onChange: (newVal: string) => void;
  placeholder: string;
  minRows: number;
  setCursorPosition: ({}: { x: number; y: number }) => void;
  findCursor: boolean;
  handleKeyDown?: (evt: any) => void;
}

export const Textarea = (props: TextAreaProps) => {
  const { value, onChange, placeholder, minRows, setCursorPosition, findCursor, handleKeyDown } =
    props;

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
        // extra width and height values to account for padding
        const cursorX = textareaRect.left + hiddenDiv.offsetWidth + 16;
        const cursorY = textareaRect.top + hiddenDiv.offsetHeight + 24;
        setCursorPosition({ x: cursorX, y: cursorY });
      }
    }
    // the useEffect should not run if value, a suggested dependency, changes
    // the open menu should stay in its original position as the text value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findCursor, setCursorPosition]);

  return (
    <div className="w-full relative">
      <TextareaAutosize
        className="py-4 px-6 resize-none outline-none w-full"
        ref={textareaRef}
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={(evt) => onChange(evt.target.value)}
        onKeyDown={(evt) => handleKeyDown && handleKeyDown(evt.key)}
      />
      <div className="absolute invisible" ref={hiddenDivRef} />
    </div>
  );
};
