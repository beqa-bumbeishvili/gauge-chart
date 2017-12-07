/*  

This code is based on following convention:

https://github.com/bumbeishvili/d3-coding-conventions/blob/84b538fa99e43647d0d4717247d7b650cb9049eb/README.md


*/

function renderChart(params) {

  // Exposed variables
  var attrs = {
    id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
    svgWidth: 1000,
    svgHeight: 1000,
    chartWidth: 300,
    chartHeight: 300,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    marginLeft: 5,
    container: 'body',
    labelsSpacing: 40,
    innerRadius: 125,
    borderWidthForSubstraction:10,
    cornerRadius: 15,
    borderDotRadius: 15,
    dotStrokeWidth: 10,
    data: null
  };


  //InnerFunctions which will update visuals
  var updateData;

  //Main chart object
  var main = function (selection) {
    selection.each(function scope() {

      //Calculated properties
      var calc = {}
      calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      calc.chartRadius = Math.min(attrs.chartWidth, attrs.chartHeight) / 2;
      calc.angleRange = 0.5 * Math.PI;

      //Arcs
      var arcs = {}

      //chart arc
      arcs.mainArc = d3.arc()
        .outerRadius(calc.chartRadius - attrs.borderWidthForSubstraction)
        .innerRadius(attrs.innerRadius)
        .cornerRadius(12);

      //arc for labels  
      arcs.labelArc = d3.arc()
        .outerRadius(calc.chartRadius - attrs.labelsSpacing)
        .innerRadius(calc.chartRadius - attrs.labelsSpacing)

      //Drawing containers
      var container = d3.select(this);

      //Add svg
      var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
        .attr('width', attrs.svgWidth)
        .attr('height', attrs.svgHeight);

      //Add container g element
      var chart = svg.patternify({ tag: 'g', selector: 'chart' })
        .attr("transform", "translate(" + calc.chartWidth / 4 + "," + calc.chartHeight / 5 + ")");

      //create pie layout
      var pie = d3.pie()
        .startAngle(calc.angleRange * -1)
        .endAngle(calc.angleRange)
        .value(function (d) { return d.presses; })(attrs.data);

      //pie group
      var pieGroup = chart.selectAll("arc")
        .data(pie)
        .enter().append("g")
        .attr("class", "arc");

      //display chart
      pieGroup.append("path")
        .attr("d", arcs.mainArc)
        .style("stroke", "#fff")
        .attr('stroke-width', 5)
        .style("fill", function (d) { return d.data.color; });

      //create group element for border dot
      var dotGroup = chart.patternify({ tag: 'g', selector: 'border-dot-group' })
        .attr("transform", getPositionFromValue(200));

      var borderDot = dotGroup
        .patternify({ tag: 'circle', selector: 'border-dot' })
        .attr('r',attrs.borderDotRadius)
        .attr('fill','#FFFFFF')
        .attr('stroke','#1799CE')
        .attr('stroke-width',attrs.dotStrokeWidth);

        //Functions
        function getPositionFromValue(value){
          return "translate(" + -92 + "," + -95 + ")";
        }

      // Smoothly handle data updating
      updateData = function () {

      }
      //#########################################  UTIL FUNCS ##################################

      function debug() {
        if (attrs.isDebug) {
          //Stringify func
          var stringified = scope + "";

          // Parse variable names
          var groupVariables = stringified
            //Match var x-xx= {};
            .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
            //Match xxx
            .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
            //Get xxx
            .map(v => v[0].trim())

          //Assign local variables to the scope
          groupVariables.forEach(v => {
            main['P_' + v] = eval(v)
          })
        }
      }
      debug();
    });
  };

  //----------- PROTOTYEPE FUNCTIONS  ----------------------
  d3.selection.prototype.patternify = function (params) {
    var container = this;
    var selector = params.selector;
    var elementTag = params.tag;
    var data = params.data || [selector];

    // Pattern in action
    var selection = container.selectAll('.' + selector).data(data, (d, i) => {
      if (typeof d === "object") {
        if (d.id) {
          return d.id;
        }
      }
      return i;
    })
    selection.exit().remove();
    selection = selection.enter().append(elementTag).merge(selection)
    selection.attr('class', selector);
    return selection;
  }

  //Dynamic keys functions
  Object.keys(attrs).forEach(key => {
    // Attach variables to main function
    return main[key] = function (_) {
      var string = `attrs['${key}'] = _`;
      if (!arguments.length) { return eval(` attrs['${key}'];`); }
      eval(string);
      return main;
    };
  });

  //Set attrs as property
  main.attrs = attrs;

  //Debugging visuals
  main.debug = function (isDebug) {
    attrs.isDebug = isDebug;
    if (isDebug) {
      if (!window.charts) window.charts = [];
      window.charts.push(main);
    }
    return main;
  }

  //Exposed update functions
  main.data = function (value) {
    if (!arguments.length) return attrs.data;
    attrs.data = value;
    if (typeof updateData === 'function') {
      updateData();
    }
    return main;
  }

  // Run  visual
  main.run = function () {
    d3.selectAll(attrs.container).call(main);
    return main;
  }

  return main;
}
