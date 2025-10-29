import { Handle, Position } from '@xyflow/react';
import { Folder, File } from 'lucide-react';

export const TopicNode = ({ data }: { data: any }) => (
  <div className="relative px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold min-w-[140px] text-center">
    <Folder className="inline mr-2" size={16} />
    {data.label}
    <div className="text-sm opacity-80">{data.count} notes</div>

    <Handle type="source" position={Position.Right} id="right" />
    <Handle type="target" position={Position.Left} id="left" />
  </div>
);

export const TagNode = ({ data }: { data: any }) => (
  <div className="relative px-3 py-2 bg-green-500 text-white rounded-md font-medium min-w-[120px] text-center">
    {data.label}
    <div className="text-sm opacity-80">{data.count} notes</div>

    <Handle type="source" position={Position.Right} id="right" />
    <Handle type="target" position={Position.Left} id="left" />
  </div>
);

export const NoteNode = ({ data }: { data: any }) => (
  <div
    className={`relative px-3 py-2 rounded-md cursor-pointer transition-all min-w-[160px] text-sm ${
      data.selected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
    }`}
    onClick={() => data.onSelect(data.note)}
  >
    <File className="inline mr-2" size={14} />
    <div className="font-medium truncate">{data.note.title || 'Untitled'}</div>
    <div className="text-xs opacity-70">{new Date(data.note.updatedAt).toLocaleDateString()}</div>

    <Handle type="target" position={Position.Left} id="left" />
  </div>
);


export const nodeTypes = {
  topic: TopicNode,
  tag: TagNode,
  note: NoteNode,
};