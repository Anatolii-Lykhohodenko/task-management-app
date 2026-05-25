'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Heading2,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  defaultValue?: Record<string, unknown> | null;
};

export default function RichTextEditor({ name, defaultValue }: Props) {
  const [json, setJson] = useState(
    defaultValue ? JSON.stringify(defaultValue) : ''
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue ?? '',
    onUpdate: ({ editor }) => {
      setJson(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'min-h-32 px-3 py-2 text-sm focus:outline-none',
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring'
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1 py-1">
        <Toggle
          size="sm"
          pressed={editor?.isActive('bold')}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('italic')}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('strike')}
          onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Toggle>

        <div className="mx-1 h-4 w-px bg-border" />

        <Toggle
          size="sm"
          pressed={editor?.isActive('heading', { level: 2 })}
          onPressedChange={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Toggle>

        <div className="mx-1 h-4 w-px bg-border" />

        <Toggle
          size="sm"
          pressed={editor?.isActive('bulletList')}
          onPressedChange={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
          aria-label="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('orderedList')}
          onPressedChange={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
          aria-label="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Toggle>

        <div className="mx-1 h-4 w-px bg-border" />

        <Toggle
          size="sm"
          pressed={editor?.isActive('code')}
          onPressedChange={() => editor?.chain().focus().toggleCode().run()}
          aria-label="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </Toggle>
      </div>

      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={json} />
    </div>
  );
}
