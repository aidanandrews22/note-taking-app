import { useEffect, useState, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { lightTheme } from './lightTheme';
import type React from 'react';

export const transparentTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent !important',
    height: '100%',
  },
});

const customSyntaxHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '2em', fontWeight: 'bold' },
  { tag: tags.heading2, fontSize: '1.5em', fontWeight: 'bold' },
  { tag: tags.heading3, fontSize: '1.17em', fontWeight: 'bold' },
  { tag: tags.heading4, fontSize: '1em', fontWeight: 'bold' },
  { tag: tags.heading5, fontSize: '0.83em', fontWeight: 'bold' },
  { tag: tags.heading6, fontSize: '0.67em', fontWeight: 'bold' },
]);

const markdownStyling = EditorView.baseTheme({
  '.cm-content': {
    fontSize: '16px',
    lineHeight: '1.5',
  },
  '.cm-line': {
    padding: '0 2px 0 6px',
  },
  '.cm-formatting-list': {
    display: 'inline-block',
    width: '1em', // Adjust if necessary to match the indentation of list items in preview
  },
});

interface Props {
  initialDoc: string;
  onChange?: (state: EditorState) => void;
}

const useCodeMirror = <T extends Element>(props: Props): [React.RefObject<T>, EditorView | null] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const { onChange } = props;

  useEffect(() => {
    if (!refContainer.current) return;

    const startState = EditorState.create({
      doc: props.initialDoc,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        indentOnInput(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        syntaxHighlighting(customSyntaxHighlighting),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
          addKeymap: true,
        }),
        lightTheme,
        transparentTheme,
        markdownStyling,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) {
            onChange(update.state);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
    });
    setEditorView(view);

    return () => {
      view.destroy();
    };
  }, [refContainer]);

  return [refContainer, editorView];
};

export default useCodeMirror;