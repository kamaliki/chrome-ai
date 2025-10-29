import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, useNodesState, useEdgesState, Position, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Note } from '../../types/chrome-ai';
import { nodeTypes } from './CustomNodes';

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 200;
  const nodeHeight = 60;
  dagreGraph.setGraph({ 
    rankdir: 'LR', 
    ranksep: 20, 
    nodesep: 15,
    // marginx: 50,         // adds some left margin
    // marginy: 50,
  });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map(node => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });

  return { nodes: layoutedNodes, edges };
};

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

    // ✅ Build topic/tag/note hierarchy
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

    const levelSpacing = 20;
    let globalY = 0;

    const countNotes = (node: any): number => {
      let count = node.notes.length;
      Object.values(node.children).forEach((child: any) => {
        count += countNotes(child);
      });
      return count;
    };

    const createNodes = (data: any, parentId: string | null, level: number, x: number) => {
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        // ✅ create a node for this topic or tag
        const nodeIdStr = `node-${nodeId++}`;
        const nodeType = level === 0 ? 'topic' : 'tag';
        const totalNotes = countNotes(value);

        const y = globalY;
        globalY += Math.max(value.notes.length * 70, 100);

        nodes.push({
          id: nodeIdStr,
          type: nodeType,
          position: { x, y },
          data: { label: key, count: totalNotes },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          parentId: parentId || undefined,   
          //extent: parentId ? 'parent' : undefined
        });

        if (parentId) {
          edges.push({
            id: `edge-${parentId}-${nodeIdStr}`,
            source: parentId,
            target: nodeIdStr,
            sourceHandle: 'right',
            targetHandle: 'left',
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          });
        }

        // ✅ Recursively add children
        if (Object.keys(value.children).length > 0) {
          createNodes(value.children, nodeIdStr, level + 1, x + levelSpacing);
        }

        // ✅ Add notes as leaf nodes
        value.notes.forEach((note: Note, index: number) => {
          const noteNodeId = `note-${nodeId++}`;
          const noteX = x + levelSpacing;
          const noteY = globalY + index * 60;

          nodes.push({
            id: noteNodeId,
            type: 'note',
            position: { x: noteX, y: noteY },
            data: {
              note,
              selected: selectedNote?.id === note.id,
              onSelect: onNoteSelect,
            },
            targetPosition: Position.Left,
            parentId: nodeIdStr,  
            //extent: 'parent',
          });

          edges.push({
            id: `edge-${nodeIdStr}-${noteNodeId}`,
            source: nodeIdStr,
            target: noteNodeId,
            sourceHandle: 'right',
            targetHandle: 'left',
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          });
        });

        globalY += value.notes.length * 60;
      });
    };

    createNodes(tree, null, 0, 0);

    return getLayoutedElements(nodes, edges);
  }, [notes, selectedNote, onNoteSelect]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  return (
    <div className="h-[600px] border rounded-lg bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable
        nodesConnectable
        panOnDrag
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};
