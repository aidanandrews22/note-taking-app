import React, { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkReact from 'remark-react';
import RemarkCode from './RemarkCode';
import { defaultSchema } from 'hast-util-sanitize';
import 'github-markdown-css/github-markdown.css';

const Preview = ({ doc }) => {
  const md = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkReact, {
        createElement: React.createElement,
        sanitize: defaultSchema,
        remarkReactComponents: {
          code: RemarkCode
        }
      })
      .processSync(doc).result;
  }, [doc]);

  return (
    <div className="preview markdown-body">
      {md}
    </div>
  );
};

export default React.memo(Preview);