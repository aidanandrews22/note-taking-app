import React, { useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const GraphView = ({ data, type, onNodeClick }) => {
  const navigate = useNavigate();
  const fgRef = useRef();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const getNodeColor = useCallback((node) => {
    const colors = {
      notes: {
        School: '#1f77b4',
        Work: '#ff7f0e',
        Misc: '#2ca02c',
        Personal: '#d62728'
      }
    };
    if (highlightNodes.size > 0) {
      return highlightNodes.has(node) ? colors[type][node.name] || '#999' : '#999';
    }
    return node.isCategory ? colors[type][node.name] || '#999' : '#999';
  }, [type, highlightNodes]);

  const handleNodeClick = useCallback((node) => {
    if (node.isCategory) {
      onNodeClick(node.name);
      const connectedNodes = data.links
        .filter(link => link.target === node.id)
        .map(link => data.nodes.find(n => n.id === link.source));
      setHighlightNodes(new Set(connectedNodes));
      setHighlightLinks(new Set(data.links.filter(link => link.target === node.id)));
    } else {
      navigate(`/${type}/${node.id}`);
    }
  }, [navigate, type, data, onNodeClick]);

  const handleNodeHover = useCallback((node) => {
    setHoverNode(node || null);
    setHighlightNodes(new Set(node ? [node] : []));
    setHighlightLinks(new Set(node ? data.links.filter(link => link.source === node.id || link.target === node.id) : []));
  }, [data]);

  useEffect(() => {
    const fg = fgRef.current;
    fg.d3Force('charge').strength(-120);
    fg.d3Force('link').distance(link => link.distance);

    if (fg && data.nodes.length > 0) {
      setTimeout(() => {
        fg.zoomToFit(400, 20);
      }, 500);
    }
  }, [data]);

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        backgroundColor='#fff'
        nodeLabel="name"
        nodeColor={getNodeColor}
        nodeVal={(node) => node.isCategory ? 20 : 10}
        nodeResolution={16}
        linkWidth={link => highlightLinks.has(link) ? 2 : 1}
        linkColor={link => highlightLinks.has(link) ? '#f00' : '#999'}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeThreeObject={node => {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load('/assets/dot.png') })
          );
          sprite.scale.set(12, 12);
          return sprite;
        }}
        nodeThreeObjectExtend={true}
        enableNodeDrag={false}
        enableNavigationControls={true}
        showNavInfo={true}
      />
    </div>
  );
};

export default GraphView;