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

  @ViewChild('fileInput')
  public fileInput: any;
  public file: File | null = null;

  public progress: number = 0;

  private allPapers: any = [];
  private maxNum: number = 0;
  private currentNum: number = 0;

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

    console.log(this.graph.nodes);
    
    this.initGraph();

    // doi search debug
    // doi:10.1002/0470841559.ch1 ]
      // CrossRef.work('https://doi.org/10.1002/0470841559.ch1', (err: any, item: any) => {
      //   console.log(item);
      // });
    
    // retrieval doi debug
    // CrossRef.works(
    // {
    //   'rows': '1',
    //   'query.bibliographic': 'Comparison',
    //   'query.author': 'Andries+et+al'
    // }
    // , (err: any, item: any) => {
    //   console.log(item);
    // });
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // console.log(event.target.innerHeight);
    // console.log(event.target.innerWidth);
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
          console.log(e);
          alert('Invalid File Format. \nPlease report below error on GitHub. \n' + e) 
        }

      }
    } catch(e: any) {
      console.log(e);
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
        // doi check
        let item: any = [];
        if (!row.doi) {
          // get item from title
          parallelFunctions.push(this.retrieveDOIByTitle(row.title))
          // item = await this.retrieveDOIByTitle(row.title);
        } else {
          parallelFunctions.push(this.getItemByDOI(row.doi))
          // item = await this.getItemByDOI(row.doi);
        }
        // console.log(item);

        // count up
        // currentNum++;
        // this.progress = currentNum / maxNum * 100;

        // if not exist, continue loop
        // if (!item || item.length < 1) {
        //   continue;
        // }

        // console.log(item);
        // this.allPapers.push(item);

      }

      const items = await Promise.all(parallelFunctions);
      console.log(items);


    } catch(e: any) {
      // throw
      Promise.reject(e);
    }
  }


  private async getItemByDOI(doi: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
            // CrossRef.work('https://doi.org/10.1002/0470841559.ch1', (err: any, item: any) => {
      //   console.log(item);
      // });
      // console.log(doi);
      CrossRef.work('https://doi.org/' + doi, (err: any, item: any) => {
        this.currentNum++;
        this.progress = this.currentNum / this.maxNum * 100;
        if (err) {
          // reject(err);
          resolve([]);
        }
        resolve(item);
      });
    })
  }

  /**
   * retrieve DOI By Title
   * @param title paper title
   */
  private async retrieveDOIByTitle(title: string): Promise<any> {

    return new Promise((resolve: any, reject: any) => {
      CrossRef.works(
        {
          'rows': '1',
          'query.bibliographic': title,
          // 'query.author': row.author ? row.author : '',
        }
        , (err: any, item: any) => {
        this.currentNum++;
        this.progress = this.currentNum / this.maxNum * 100;
          if (err) {
            // reject(err);
            resolve([]);
          }
          resolve(item[0]);
        });
    })
  }

  private initGraph() {

    for (let i = 0; i < this.graph.nodes.length; i++) {
      this.graph.nodes[i] = {index: i, abc: "abc"};
    }

    const svg: any = d3.select("#graph_canvas");
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
