var dataList = []

let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

let req = new XMLHttpRequest()
req.open('GET', url, true)
req.send()
req.onload = () => {

    json = JSON.parse(req.responseText)

    baseTemp = json.baseTemperature         // base temperature to use to find temperature of corresponding year

    dataList = json.monthlyVariance.map( obj => {

        year = obj.year;
        month = obj.month;       // int representation of year
        variance = obj.variance;

        return [year, month, variance];

    })      // extract data from JSON and store in dataList

    createGraph(dataList, baseTemp);

}

/// D3 scatterplot ///
let createGraph = (dataList, base) => {

    // specs of svg frame //
    const w = 1500;
    const h = 700;
    const padding = 80;

    let svg = d3.select('#main')
            .append('svg')
            .attr('height', h)
            .attr('width', w);

    // scales x values to width of svg frame //
    let xScale = d3.scaleLinear()
            .domain( [d3.min(dataList, d => d[0]), d3.max(dataList, d => d[0]) ] ) 
            .range( [padding + 1, w - padding] );    // added to 1 to move rectangles off the axisLeft

    // xAxis //
    let xAxis = d3.axisBottom(xScale)     // format of x-axis
            .tickValues(d3.range(1760, 2020, 10) )
            .tickFormat(d3.format('i'));

    svg.append('g')             // actual x-axis creation
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .call(xAxis)
        .attr('id', 'x-axis');

    svg.append('text')          // xlabel
        .attr('x', w / 2)
        .attr('y', h - 40)
        .text('Year');

    // scales y values to height of svg frame //
    const yScale = d3.scaleLinear()
            .domain( [13,1] )
            .range( [h - padding, padding / 2] );

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

    // yAxis //
    const yAxis = d3.axisLeft(yScale) // y-axis format
            .tickValues(d3.range(1.5, 13.5, 1))
            .tickFormat((d,i) => months[i]);

    svg.append('g')             // actual y-axis creation 
        .attr('transform', 'translate(' + padding + ',0)')
        .call(yAxis)
        .attr('id', 'y-axis');

    svg.append('text')          // y-label
        .attr('x', 0 - h / 2)
        .attr('y', 30)
        .attr('id', 'y-label')
        .attr('transform', 'rotate(-90)')
        .text('Months');

    /// tooltip ///
    let tooltip = d3.select('#main')
                .append('div')
                .attr('id', 'tooltip')
                .style('position', 'absolute')
                .style('z-index', '10')
                .style('visibility', 'hidden')
                .text('Test Text');

    // height and width of each cell
    const cellH = h / 14.45;
    const cellW = 5.35;

    svg.selectAll('rect')               // record: [year, month, variance]
        .data(dataList)
        .enter()
        .append('rect')
        .attr('data-year', d => d[0])
        .attr('data-month', d => d[1] - 1)
        .attr('data-temp', d => {
            return base + d[2]
        })
        .attr('class', 'cell')
        .attr('x', d => xScale(d[0]) )
        .attr('y', d => yScale(d[1]) )
        .attr('height', cellH)
        .attr('width', cellW)
        .attr('fill', function (d) {

            // cold to hot fill colors
            let colors = {
                2.8 : '#00185C',
                3.9 : '#153F6F', 
                5.0 : '#2877D2',
                6.1 : '#3E76B6',
                7.2 : '#7EADE7',
                8.3 : '#FFF3AD',
                9.5 : '#FFDD1F',
                10.6 :'#FFB647',
                11.7 :'#FC600A',
                12.8 :'#FE200B',
            }

            let color

            for (let key in colors) {

                if ( (d[2] + base) < key) {     // want to learn how to use data attribute in d3
                    color = colors[key]
                    break
                } else {
                    color = '#B21001'
                }

            }

            return color
                
        })
        .on('mouseover', function (d) {     // note that arrow functions do now allow THIS to be used

            let year = d3.select(this).attr('data-year')
            let month = months[d[1] - 1]
            let temp = Math.round( (base + d[2]) * 10) / 10          // round to 1 decimal place
            let variance = Math.round (d[2] * 10) / 10

            tooltip.html(year + ' - ' + month + 
            '<br>' +  temp + '℃' +
            '<br>' + variance + '℃')

            // rectAttr = (d3.select(this).node().getBoundingClientRect())     // attributes of the actual dom rectangle
            // console.log(rectAttr)
            let xCoord = d3.select(this).attr('x')
            let yCoord = d3.select(this).attr('y')

            tooltip.style('top', yCoord + "px")
                    .style('left', xCoord - 50 + 'px')
                    .style('visibility', 'visible')
                    .attr('data-year', year)

        })
        .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
        });

    /// legend ///
    const legendH = 30
    const legendW = 350

    const legend = d3.select('#main')         // might need svg to append axisBottom
            .append('div')
            .attr('id', 'legend')

    const legendxScale = d3.scaleLinear()
            .domain( [1.75, 13.9] ) 
            .range( [0, 321] )          // just scale to 12 equal squares

    legend.append('svg')                // add svg container to legend to fill with rect
        .attr('id', 'legend-svg')
        .attr('width', '350')
        .attr('height', '100')
        .selectAll('rect')
        .data(d3.range(0, 11, 1))
        .enter()
        .append('rect')
        .attr('width', legendW / 12)
        .attr('height', legendH)
        .attr('x', (d,i) => i * (legendW / 12) )
        .attr('fill', (d,i) => {        // create gradient of colors based on x (index) position         
            colors = [
                '#00185C',
                '#153F6F', 
                '#2877D2',
                '#3E76B6',
                '#7EADE7',
                '#FFF3AD',
                '#FFDD1F',
                '#FFB647',
                '#FC600A',
                '#FE200B',
                '#B21001'
            ]

            return colors[i];
        })

    const legendxAxis = d3.axisBottom(legendxScale)     // format of x-axis
                .tickValues([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
                .tickFormat(d3.format('.1f'))
                .tickSizeOuter(0)

    d3.select('#legend-svg')
        .append('g')                     // actual legend x-axis creation
        .attr('transform', 'translate(0,' + (legendH) + ')')
        .call(legendxAxis)
        .attr('id', 'legend-x-axis')
}