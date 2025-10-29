import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, useNodesState, useEdgesState, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Note } from '../../types/chrome-ai';
import { nodeTypes } from './CustomNodes';

interface TreeVisualizationProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  notes,
  selectedNote,
  onNoteSelect
}) => {
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 0;
    
    const tree: any = {};
    
    notes.forEach(note => {
      const topic = note.topic || 'Uncategorized';
      const tags = note.tags || [];
      
      if (!tree[topic]) {
        tree[topic] = { notes: [], children: {} };
      }
      
      let current = tree[topic];
      tags.forEach(tag => {
        if (!current.children[tag]) {
          current.children[tag] = { notes: [], children: {} };
        }
        current = current.children[tag];
      });
      
      current.notes.push(note);
    });
    
    let yOffset = 0;
    const levelSpacing = 200;
    const nodeSpacing = 80;
    
    const createNodes = (data: any, parentId: string | null, level: number, x: number, y: number) => {
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key === 'notes' || key === 'children') return;
        
        const nodeIdStr = `node-${nodeId++}`;
        const nodeType = level === 0 ? 'topic' : 'tag';
        const totalNotes = countNotes(value);
        
        nodes.push({
          id: nodeIdStr,
          type: nodeType,
          position: { x, y },
          data: { label: key, count: totalNotes },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });
        
        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${nodeIdStr}`,
            source: parentId,
            target: nodeIdStr,
          });
        }
        
        let childY = y;
        
        if (Object.keys(value.children).length > 0) {
          createNodes(value.children, nodeIdStr, level + 1, x + levelSpacing, childY);
          childY += Object.keys(value.children).length * nodeSpacing;
        }
        
        value.notes.forEach((note: Note, index: number) => {
          const noteNodeId = `note-${nodeId++}`;
          const noteX = x + levelSpacing * (level + 1);
          const noteY = childY + (index * 60);
          
          nodes.push({
            id: noteNodeId,
            type: 'note',
            position: { x: noteX, y: noteY },
            data: {
              note,
              selected: selectedNote?.id === note.id,
              onSelect: onNoteSelect
            },
            targetPosition: Position.Left,
          });
          
          edges.push({
            id: `edge-${nodeIdStr}-${noteNodeId}`,
            source: nodeIdStr,
            target: noteNodeId,
          });
        });
        
        y += Math.max(Object.keys(value.children).length * nodeSpacing, value.notes.length * 60, nodeSpacing);
      });
    };
    
    const countNotes = (node: any): number => {
      let count = node.notes.length;
      Object.values(node.children).forEach((child: any) => {
        count += countNotes(child);
      });
      return count;
    };
    
    createNodes(tree, null, 0, 0, 0);
    
    return { nodes, edges };
  }, [notes, selectedNote, onNoteSelect]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);
  
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  return (
    <div className="h-96 border rounded-lg bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};