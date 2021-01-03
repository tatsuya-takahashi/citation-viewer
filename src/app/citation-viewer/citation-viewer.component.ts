/**
 * Citation Viewer
 */

import { Component, OnInit, HostListener } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import * as d3 from 'd3';

declare const require: any;
var CrossRef = require('crossref');

@Component({
  selector: 'app-citation-viewer',
  templateUrl: './citation-viewer.component.html',
  styleUrls: ['./citation-viewer.component.scss']
})
export class CitationViewerComponent implements OnInit {

  public svg_width: number = 100;
  public svg_height: number = 100;
  public svg_viewBox: string = "0 0 500 500";

  private graph = ({
    nodes: Array.from({length:13}, () => ({})),
    links: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 0 },
      { source: 1, target: 3 },
      { source: 3, target: 2 },
      { source: 3, target: 4 },
      { source: 4, target: 5 },
      { source: 5, target: 6 },
      { source: 5, target: 7 },
      { source: 6, target: 7 },
      { source: 6, target: 8 },
      { source: 7, target: 8 },
      { source: 9, target: 4 },
      { source: 9, target: 11 },
      { source: 9, target: 10 },
      { source: 10, target: 11 },
      { source: 11, target: 12 },
      { source: 12, target: 10 }
    ]
  })

  private width = 500;
  private height = Math.min(500, this.width * 0.6);
  private simulation: any;

  constructor() { }

  async ngOnInit(): Promise<void> {
    
    this.initGraph();

    // doi
    // doi:10.1002/0470841559.ch1 ]
    CrossRef.work('https://doi.org/10.1002/0470841559.ch1', (err: any, item: any) => {
      console.log(item);
    });
    
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event.target.innerHeight);
    console.log(event.target.innerWidth);
    this.svg_width = event.target.innerWidth;
    this.svg_height = event.target.innerHeight;
  }

  public onChangeFileInput() {
  }

  public onClickFileInputButton() {
  }

  private initGraph() {

    for (let i = 0; i < this.graph.nodes.length; i++) {
      this.graph.nodes[i] = {index: i, abc: "abc"};
    }

    const svg: any = d3.select("svg");
    const g = svg.append("g");
    const link = g
        .selectAll(".link")
        .data(this.graph.links)
        .join("line")
        .classed("link", true);
    const node = g
        .selectAll(".node")
        .data(this.graph.nodes)
        .join("circle")
        .attr("r", 12)
        .classed("node", true)
        .attr("id", (d: any) => {return "id_" + d.index})
        .classed("fixed", (d: any) => d.fx !== undefined);

    // yield svg.node();

    this.simulation = d3
      .forceSimulation()
      .nodes(this.graph.nodes)
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force("link", d3.forceLink(this.graph.links))
      .on("tick", tick);

    this.simulation.velocityDecay(0.95);

    this.simulation
    .force('collision', d3.forceCollide().radius(function (d) {
        return 40;
    }));

    const drag: any = d3
      .drag()
      .on("start", (event: any, d: any) => {
        // console.log(d);
        d3.select("#id_" + d.index).classed("fixed", true);
      })
      .on("drag", (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
        this.simulation.alphaTarget(1.0).restart();
      }).on('end', (event: any, d: any) => {
        // this.simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
      });

    node.call(drag).on("click", (event: any, d: any) => {
      delete d.fx;
      delete d.fy;
      d3.select("#id_" + d.index).classed("fixed", false);
      this.simulation.alpha(1).restart();
    });

    svg.call(d3.zoom()
    .extent([[0, 0], [window.innerWidth, window.innerHeight]])
    .scaleExtent([0.2, 24])
    .on("zoom", ({transform}) => {
      g.attr("transform", transform);
    }));

    function tick() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    }    
   
  }
}
