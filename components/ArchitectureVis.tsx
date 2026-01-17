import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { INITIAL_GRAPH_DATA } from '../constants';
import { NodeData, LinkData } from '../types';
import { geminiService } from '../services/geminiService';
import { Info } from 'lucide-react';

const ArchitectureVis: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    const simulation = d3.forceSimulation(INITIAL_GRAPH_DATA.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(INITIAL_GRAPH_DATA.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(INITIAL_GRAPH_DATA.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(INITIAL_GRAPH_DATA.nodes)
      .join("circle")
      .attr("r", (d) => d.group === 1 ? 12 : d.group === 2 ? 10 : 8)
      .attr("fill", (d) => {
        switch(d.type) {
          case 'rust': return '#FF8E31'; // Orange
          case 'js': return '#24C8DB'; // Blue
          case 'core': return '#FFC131'; // Gold
          case 'bridge': return '#888888';
          default: return '#666';
        }
      })
      .call(drag(simulation) as any)
      .on("click", (event, d) => {
        handleNodeClick(d as NodeData);
      });

    node.append("title")
      .text((d) => d.id);

    const labels = svg.append("g")
      .selectAll("text")
      .data(INITIAL_GRAPH_DATA.nodes)
      .join("text")
      .attr("dy", 25)
      .attr("text-anchor", "middle")
      .text((d) => d.label)
      .attr("fill", "#ccc")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, []);

  const handleNodeClick = async (node: NodeData) => {
    setSelectedNode(node);
    setExplanation("");
    setLoadingExplanation(true);
    const text = await geminiService.explainArchitectureNode(node.label);
    setExplanation(text);
    setLoadingExplanation(false);
  };

  return (
    <div className="flex h-full bg-tauri-dark relative">
      <div className="flex-1 relative" ref={wrapperRef}>
         <svg ref={svgRef} className="w-full h-full cursor-move"></svg>
         <div className="absolute top-4 left-4 bg-tauri-card/80 p-2 rounded border border-gray-700 text-xs backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#FF8E31]"></div>Rust (Backend)</div>
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-[#24C8DB]"></div>JS (Frontend)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#888888]"></div>IPC Bridge</div>
         </div>
      </div>
      
      {/* Sidebar Info Panel */}
      <div className="w-80 bg-tauri-card border-l border-gray-800 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <Info className="text-tauri-accent" size={20} />
           Architecture Node
        </h2>
        
        {selectedNode ? (
          <div className="space-y-4 animate-fadeIn">
             <div>
               <label className="text-xs text-gray-500 uppercase">Component</label>
               <p className="text-lg text-tauri-blue font-mono">{selectedNode.label}</p>
             </div>
             
             <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 min-h-[100px]">
               <label className="text-xs text-gray-500 uppercase block mb-2">AI Explanation</label>
               {loadingExplanation ? (
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                 </div>
               ) : (
                 <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
               )}
             </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-10 text-sm">
            Click on a node in the graph to understand its role in the Tauri ecosystem.
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectureVis;