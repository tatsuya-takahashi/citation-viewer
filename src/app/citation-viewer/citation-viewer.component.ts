/**
 * Citation Viewer
 */

import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
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

  public isFileReading: boolean = false;
  public isFileReaded: boolean = false;

  public papertitle: string = "";
  public abstract: string = "";

  @ViewChild('fileInput')
  public fileInput: any;
  public file: File | null = null;

  public progress: number = 0;

  private allPapers: any = [];
  private maxNum: number = 0;
  private currentNum: number = 0;

  private graphNodes: any = [];
  private graphEdges: any = [];

  private graph = ({
    nodes: [
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 0, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'search'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 1, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'search'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 2, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'search'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 3, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 4, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 5, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 6, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 7, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 8, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 9, IF:  Math.floor( Math.random() * (100 + 1 - 0) ) + 0 , year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi', given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 10, IF: Math.floor( Math.random() * (100 + 1 - 0) ) + 0, year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi',  given: 'Tatsuya'}], type: 'doi'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 11, IF: Math.floor( Math.random() * (100 + 1 - 0) ) + 0, year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi',  given: 'Tatsuya'}], type: 'none'},
      { abstract: 'abstract abstract abstract', title: 'title title title', index: 12, IF: Math.floor( Math.random() * (100 + 1 - 0) ) + 0, year: Math.floor( Math.random() * (2022 + 1 - 1950) ) + 1950, author: [{family: 'Takahashi',  given: 'Tatsuya'}], type: 'none'},
      
    ],
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
    this.createGraph(this.graph.nodes, this.graph.links);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.svg_width = event.target.innerWidth;
    this.svg_height = event.target.innerHeight;
  }

  public async onChangeFileInput() {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
    const reader = new FileReader();
    try {
      reader.readAsText(this.file);
      reader.onload = async (ev) => {

        try {
          //テキストエリアに表示する
          const plaintext: any = reader.result;
          const jsontext: any = JSON.parse(plaintext);

          await this.readMetadata(jsontext);
        } catch(e: any) {
          console.error(e);
          alert('Invalid File Format. \nPlease report below error on GitHub. \n' + e) 
        }

      }
    } catch(e: any) {
      console.error(e);
      alert('Invalid File Format.' + e)
    }
    
  }

  public onClickFileInputButton() {
    this.fileInput.nativeElement.click();
  }

  /**
   * readMetadata
   * @param jsontext json file exported from paperpile
   */
  private async readMetadata(jsontext: any): Promise<any> {

    // change flg
    this.isFileReading = true;

    // init progress
    this.maxNum = jsontext.length;
    this.currentNum = 0;
    const parallelFunctions: any = [];

    try {
      for (const row of jsontext) {
        console.log(row);
        parallelFunctions.push(this.getItem(row));
      }

      // get items
      const items: any = await Promise.all(parallelFunctions);

      // graph nodes
      let idx: number = 0;
      for (const item of items) {
        console.log(item);
        this.graphNodes.push({
          index: idx,
          DOI: item.DOI,
          title: item.title[0],
          author: item.author,
          IF: item["is-referenced-by-count"] ? item["is-referenced-by-count"] : 0,
          type: item.itemtype,
          year: item.created["date-parts"][0],
          abstract: item.abstract
        })
        idx++;
      }
    
      // graph edges
      idx = 0;
      for (const item of items) {
        if (item.reference) {
          for (const ref of item.reference) {
            if (ref.DOI) {
              let targetIdx: number = -1;

              for (const g of this.graphNodes) {
                if (ref.DOI == g.DOI) {
                  targetIdx = g.index;
                  break;
                }
              }
              if (targetIdx > -1) {
                this.graphEdges.push({
                  source: idx,
                  target: targetIdx
                })
              }
              targetIdx = -1;
            }
          }
        }
        idx++;
      }

      await this.createGraph(this.graphNodes, this.graphEdges);

      this.isFileReaded = true;

    } catch(e: any) {
      // throw
      Promise.reject(e);
    }
  }

  private async createGraph(nodes: any, edges: any) {

    // get svg
    const svg: any = d3.select("#graph_canvas");
    svg.selectAll("*").remove();

    // arrowhead
    svg.append('defs').append('marker')
    .attr('id', 'arrowhead',)
    .attr('viewBox', '-0 -5 10 10',)
    // .attr('refX', (d: any) => {
    //   console.log(d);
    //   let IF: number = 0;
    //   if (d.IF > 50) { IF = 50 + 20} else {IF = d.IF + 20}
    //   return IF.toString() + 'px'
    // })
    .attr('refX', 70,)
    .attr('refY', 0,)
    .attr('orient', 'auto',)
    .attr('markerWidth', 9,)
    .attr('markerHeight', 9,)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke','none');
    
    // append g
    const g = svg.append("g");

    // create svg line
    const link = g
        .selectAll(".link")
        .data(edges)
        .join("line")
        .classed("link", true)
        .attr('marker-end','url(#arrowhead)');

    // create svg node circle
    const node = g
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append('g')
        .attr("id", (d: any) => {return "id_" + d.index})
        .attr("class", (d: any) => {
          if (d.type == 'search') {return 'node_search'}
          else if (d.type == 'doi') {return 'node_doi'}
          else if (d.type == 'none') {return 'node_none'}
          else {return 'node_search'}
        })

    const circle = node.append("circle")
        .attr("r", (d: any) => {
          return calcSize(d.IF);
        });

    const text = node.append("text")
        .attr("x", '50%')
        .attr("y", '50%')
        .attr("dy", '-10px')
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .classed("text_inn", true)
        .text((d: any) => {return d.author && d.author.length > 0 ? d.author[0].family + ', ' + d.year: d.year});

    const outlineText = node.append("text")
        .attr("x", '50%')
        .attr("y", '50%')
        .attr("dy", '-10px')
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .classed("text_out", true)
        .text((d: any) => {return d.author && d.author.length > 0 ? d.author[0].family + ', ' + d.year: d.year});

    // force simulation
    this.simulation = d3
      .forceSimulation()
      .nodes(nodes)
      .force("charge", d3.forceManyBody().strength(-4000))
      .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
      .force('collide', d3.forceCollide(100))
      .force("link", d3.forceLink(edges))
      .force("x", d3.forceX().strength(0.4))
      .force("y", d3.forceY().strength(0.4))
      .on("tick", tick);

    // velocity
    this.simulation.velocityDecay(0.99);

    // collision
    this.simulation
    .force('collision', d3.forceCollide().radius(function (d) {
        return 100;
    }));

    // drag
    const drag: any = d3
      .drag()
      .on("start", (event: any, d: any) => {
        d3.select("#id_" + d.index).classed("fixed", true);
        this.papertitle = d.title;
        this.abstract = d.abstract;
        console.log(d.abstract);
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

    // click
    node.call(drag).on("click", (event: any, d: any) => {
      delete d.fx;
      delete d.fy;
      d3.select("#id_" + d.index).classed("fixed", false);
      this.simulation.alpha(1).restart();
    });

    // zoom
    svg.call(d3.zoom()
    .extent([[0, 0], [window.innerWidth, window.innerHeight]])
    .scaleExtent([0.2, 24])
    .on("zoom", ({transform}) => {
      g.attr("transform", transform);
    }));

    function calcSize(impactFactor: number): number {
      let size: number = 0;
      if (impactFactor > 50) { size = 50 + 20} else {size = impactFactor + 20}
      return size
    }

    // tick
    function tick() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      circle
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      text.attr('x', (d: any) => { return d.x; })
        .attr('y', (d: any) => { return d.y; });
      outlineText.attr('x', (d: any) => { return d.x; })
        .attr('y', (d: any) => { return d.y; });
    }    
  }

  private async getItem(row: any): Promise<any> {

    let item: any;

    if (!row.doi) {
      // get item from title
      item = await this.retrieveDOIByTitle(row);
      if (item) {item.itemtype = "search"; item.abstract = row.abstract ? row.abstract : ''};
    } else {
      item = await this.getItemByDOI(row);
      if (item) {item.itemtype = "doi"; item.abstract = row.abstract ? row.abstract : ''};
    }

    // progress
    this.currentNum++;
    this.progress = this.currentNum / this.maxNum * 100;

    // if not exist, continue loop
    if (!item || item.length < 1) {
      item = {
        "DOI": row.doi ? row.doi : "none",
        "title": [row.title],
        "author": row.author && row.author.length > 0 ? row.author.map((aut: any) => { return {family: aut.last, given: aut.first}}) : [],
        "itemtype": "none",
        "created": {"date-parts": row.published ? [row.published.year] : ['?']},
        "abstract": row.abstract ? row.abstract : ''
      }
    }
    return Promise.resolve(item);
  }

  /**
   * get item by doi
   * @param row paperpile json record
   */
  private async getItemByDOI(row: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      CrossRef.work('https://doi.org/' + row.doi, (err: any, item: any) => {
        if (err) {resolve([]);}
        resolve(item);
      });
    })
  }

  /**
   * retrieve DOI By Title
   * @param row paperpile json record
   */
  private async retrieveDOIByTitle(row: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      CrossRef.works({'rows': '1', 'query.bibliographic': row.title,}, (err: any, item: any) => {
        if (err) {resolve([]);}
          resolve(item[0]);
        });
    })
  }

  // private initGraph() {

  //   for (let i = 0; i < this.graph.nodes.length; i++) {
  //     this.graph.nodes[i] = {index: i, abc: "abc"};
  //   }

  //   const svg: any = d3.select("#graph_canvas");
  //   const g = svg.append("g");
  //   const link = g
  //       .selectAll(".link")
  //       .data(this.graph.links)
  //       .join("line")
  //       .classed("link", true);
  //   const node = g
  //       .selectAll(".node")
  //       .data(this.graph.nodes)
  //       .join("circle")
  //       .attr("r", 12)
  //       .classed("node", true)
  //       .attr("id", (d: any) => {return "id_" + d.index})
  //       .classed("fixed", (d: any) => d.fx !== undefined);

  //   // yield svg.node();

  //   this.simulation = d3
  //     .forceSimulation()
  //     .nodes(this.graph.nodes)
  //     .force("charge", d3.forceManyBody().strength(-200))
  //     .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
  //     .force("link", d3.forceLink(this.graph.links))
  //     .on("tick", tick);

  //   this.simulation.velocityDecay(0.95);

  //   this.simulation
  //   .force('collision', d3.forceCollide().radius(function (d) {
  //       return 40;
  //   }));

  //   const drag: any = d3
  //     .drag()
  //     .on("start", (event: any, d: any) => {
  //       // console.log(d);
  //       d3.select("#id_" + d.index).classed("fixed", true);
  //     })
  //     .on("drag", (event: any, d: any) => {
  //       d.fx = event.x;
  //       d.fy = event.y;
  //       this.simulation.alphaTarget(1.0).restart();
  //     }).on('end', (event: any, d: any) => {
  //       // this.simulation.alphaTarget(0);
  //       // d.fx = null;
  //       // d.fy = null;
  //     });

  //   node.call(drag).on("click", (event: any, d: any) => {
  //     delete d.fx;
  //     delete d.fy;
  //     d3.select("#id_" + d.index).classed("fixed", false);
  //     this.simulation.alpha(1).restart();
  //   });

  //   svg.call(d3.zoom()
  //   .extent([[0, 0], [window.innerWidth, window.innerHeight]])
  //   .scaleExtent([0.2, 24])
  //   .on("zoom", ({transform}) => {
  //     g.attr("transform", transform);
  //   }));

  //   function tick() {
  //     link
  //       .attr("x1", (d: any) => d.source.x)
  //       .attr("y1", (d: any) => d.source.y)
  //       .attr("x2", (d: any) => d.target.x)
  //       .attr("y2", (d: any) => d.target.y);
  //     node
  //       .attr("cx", (d: any) => d.x)
  //       .attr("cy", (d: any) => d.y);
  //   }    
   
  // }
}
