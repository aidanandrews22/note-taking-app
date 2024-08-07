import React, { useCallback, useEffect, useRef, useState } from 'react';
import useCodeMirror from './useCodeMirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

interface Props {
  initialDoc: string;
  onChange: (doc: string) => void;
  onHeightChange: (height: number) => void;
}

const CodeMirrorEditor: React.FC<Props> = (props) => {
  const { onChange, onHeightChange, initialDoc } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<number>(300); // Default minimum height

  const handleChange = useCallback(
    (state: EditorState) => {
      onChange(state.doc.toString());
    },
    [onChange]
  );

  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDoc,
    onChange: handleChange,
  });

  useEffect(() => {
    if (editorView) {
      const updateHeight = () => {
        const height = editorView.scrollDOM.clientHeight;
        if (height !== editorHeight) {
          setEditorHeight(height);
          onHeightChange(height);
        }
      };

      // Update height initially and whenever the content changes
      updateHeight();
      editorView.dom.addEventListener('input', updateHeight);
      
      // Also update on window resize
      window.addEventListener('resize', updateHeight);

      // Use ResizeObserver for more precise detection of size changes
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(editorView.dom);

      // Clean up the event listeners and observer
      return () => {
        editorView.dom.removeEventListener('input', updateHeight);
        window.removeEventListener('resize', updateHeight);
        resizeObserver.disconnect();
      };
    }
  }, [editorView, onHeightChange, editorHeight]);

  return (
    <div 
      className='editor-wrapper' 
      ref={refContainer}
    ></div>
  );
};

export default CodeMirrorEditor;