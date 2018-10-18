queue()
    .defer(d3.json, "./transactions.json")
    .await(makeGraph);

function makeGraph(error, transactionsData) {

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let ndx = crossfilter(transactionsData);

    let parseDate = d3.time.format("%d/%m/%Y").parse;

    transactionsData.forEach(function(d) {
        d.date = parseDate(d.date);
    });

    let dateDim = ndx.dimension(dc.pluck("date"));

    let minDate = dateDim.bottom(1)[0].date;
    let maxDate = dateDim.top(1)[0].date;

    let nameDim = ndx.dimension(dc.pluck("name"));
    let spendGroup = nameDim.group().reduceSum(dc.pluck("spend"));

    let spendChart = dc.barChart("#spend-chart");

    spendChart
        .width(500)
        .height(300)
        .dimension(nameDim)
        .group(spendGroup)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Person")
        .renderlet(function(chart) {

            var barsData = [];
            var bars = chart.selectAll('.bar').each(function(d) {
                barsData.push(d);
            });

            //Remove old values (if found)
            d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
            //Create group for labels 
            var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id', 'inline-labels');

            for (var i = bars[0].length - 1; i >= 0; i--) {

                var b = bars[0][i];
                //Only create label if bar height is tall enough
                if (+b.getAttribute('height') < 18) continue;

                gLabels.append("text")
                    .text(numberWithCommas(barsData[i].data.value))
                    .attr('x', +b.getAttribute('x') + (b.getAttribute('width') / 2))
                    .attr('y', +b.getAttribute('y') + 15)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white');
            }

        });

    dc.renderAll();

}
