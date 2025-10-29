import { Folder, File } from 'lucide-react';

export const TopicNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold min-w-[120px] text-center">
    <Folder className="inline mr-2" size={16} />
    {data.label}
    <div className="text-xs opacity-80">{data.count} notes</div>
  </div>
);

export const TagNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 bg-green-500 text-white rounded-md font-medium min-w-[100px] text-center">
    {data.label}
    <div className="text-xs opacity-80">{data.count} notes</div>
  </div>
);

export const NoteNode = ({ data }: { data: any }) => (
  <div 
    className={`px-3 py-2 rounded-md cursor-pointer transition-all min-w-[150px] ${
      data.selected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
    }`}
    onClick={() => data.onSelect(data.note)}
  >
    <File className="inline mr-2" size={14} />
    <div className="text-sm font-medium truncate">{data.note.title || 'Untitled'}</div>
    <div className="text-xs opacity-70">{new Date(data.note.updatedAt).toLocaleDateString()}</div>
  </div>
);

export const nodeTypes = {
  topic: TopicNode,
  tag: TagNode,
  note: NoteNode,
};