'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type Props = {
  content: Record<string, unknown> | null | undefined;
  className?: string;
};

export default function RichTextContent({ content, className }: Props) {
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? null,
    editable: false,
    editorProps: {
      attributes: {
        class: [
          'prose prose-sm max-w-none text-foreground',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-p:text-foreground prose-p:leading-6',
          'prose-strong:text-foreground',
          'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm',
          'prose-ul:text-foreground prose-ol:text-foreground',
          className ?? '',
        ].join(' '),
      },
    },
  });

  

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground">No description provided.</p>
    );
  }

  return <EditorContent editor={editor} />;
}
