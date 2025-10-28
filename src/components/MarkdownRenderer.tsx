import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Customizar imagens para serem responsivas
          img: ({ node, ...props }: any) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-lg shadow-sm block my-2"
              loading="lazy"
              style={{ maxHeight: '400px' }}
            />
          ),
          // Customizar tabelas
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} className="min-w-full border-collapse border border-gray-300" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-gray-300 px-4 py-2" />
          ),
          // Customizar links
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" />
          ),
          // Customizar code blocks
          code: ({ node, ...props }: any) => {
            const isInline = !props.className;
            return isInline ? (
              <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
            ) : (
              <code {...props} className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" />
            );
          },
          // Customizar blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" />
          ),
          // Customizar headings
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold text-gray-800 mt-6 mb-4" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold text-gray-800 mt-5 mb-3" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-semibold text-gray-800 mt-4 mb-2" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-base font-semibold text-gray-800 mt-3 mb-2" />
          ),
          // Customizar parágrafos
          p: ({ node, ...props }) => (
            <p {...props} className="mb-4 leading-relaxed text-gray-700" />
          ),
          // Customizar listas
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside mb-4 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-4 space-y-1" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="text-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}