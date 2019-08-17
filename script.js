/* Reponsiveness ideas from: https://webkid.io/blog/responsive-chart-usability-d3/ 
   Completed as a part of FreeCodeCamp's Data Visualization Project */


const DATASETS = {
	videogames: {
		TITLE: "Video Game Sales",
		DESCRIPTION: "Top 100 Most Sold Video Games Grouped by Platform",
		FILE_PATH: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
	},
	movies: {
		TITLE: "Movie Sales",
		DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
		FILE_PATH: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
	},
	kickstarter: {
		TITLE: "Kickstarter Pledges",
		DESCRIPTION: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Gategory",
		FILE_PATH: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
	}
}



// generated from: http://vrl.cs.brown.edu/color
const colors = ["rgb(53,136,209)", "rgb(105,224,76)", "rgb(198,103,243)", "rgb(28,234,249)", "rgb(248,47,101)", "rgb(205,219,155)", "rgb(202,98,133)", "rgb(207,223,52)", "rgb(22,146,148)", "rgb(182,197,245)", "rgb(133,153,71)", "rgb(231,13,229)", "rgb(53,151,33)", "rgb(253,89,23)", "rgb(254,201,175)", "rgb(182,117,52)", "rgb(115,119,236)", "rgb(255,185,71)"]

// template
const container = d3.select('body').append('div').attr('class', 'container');
const main = container.append('main');
const nav = main.append('nav');
const header = main.append('header');
const svg = main.append('svg').attr('id', 'treemap');
const legend = main.append('svg').attr('id', 'legend');



/* nav links to diff. data */
nav.append('a')
	.attr('href', '?data=videogames') // relative URL: adds to the current host
	.html('Video Game Data Set');
nav.append('span').html(' | ');
nav.append('a')
	.attr('href', '?data=movies')
	.html('Movies Data Set');
nav.append('span').html(' | ');
nav.append('a')
	.attr('href', '?data=kickstarter')
	.html('Kickstarter Data Set');


/* Define DATASET from link url */
let urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = 'videogames';
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];


/* Header - title & description */
header.append("h1")
	.attr("id", "title")
	.html(DATASET.TITLE);
header.append("p")
	.attr("id", "description")
	.html(DATASET.DESCRIPTION);

const Chart = (function () {

	let tooltip, colorScaleOrdinal, root,
		mapWrapper, treemap, cell, tile,
		width, height, fontSize,
		legendWidth, legendSpacing;


	d3.json(DATASET.FILE_PATH)
		.then(init)

	function init(data) {

		/* tooltip */
		tooltip = d3.select("body")
			.append('div')
			.attr('class', 'tooltip')
			.attr('id', 'tooltip')
			.style('opacity', 0)
			.style('pointer-events', 'none');

		/* scales */
		const lighter = (color) => d3.interpolateRgb(color, '#fff')(0.3); // ligher background for black text.
		colorScaleOrdinal = d3.scaleOrdinal(colors.map(lighter));



		/* root node factory for treemap */
		root = d3.hierarchy(data)
			.eachBefore(d => { // traverse nLR tagging id
				d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
			})
			.sum(nodeData => nodeData.value)
			.sort((a, b) => b.height - a.height || b.value - a.value);

		treemap = d3.treemap().paddingInner(1);


		cell = mapWrapper


		render()
	}

	function render() {

		updateDimensions(window.innerWidth);

		svg
			.attr('width', width)
			.attr('height', height)

		treemap.size([width, height]);
		treemap(root);

		mapWrapper = svg.append('g').attr('id', 'mapWrapper');

		const cell = mapWrapper.selectAll('g')
			.data(root.leaves())
			.enter().append('g')
			.attr('class', 'group cell')
			.attr('transform', d => `translate(${d.x0}, ${d.y0})`)

		const tile = cell.append('rect')
			.attr('id', d => d.data.id)
			.attr('class', 'tile')
			.attr('width', d => d.x1 - d.x0)
			.attr('height', d => d.y1 - d.y0)
			.attr('data-name', d => d.data.name)
			.attr('data-category', d => d.data.category)
			.attr('data-value', d => d.data.value)
			.attr('fill', d => colorScaleOrdinal(d.data.category))
			.on('mousemove', function (d) {

				tooltip.style('opacity', .9);
				tooltip.html(
					'Name: ' + d.data.name +
					'<br>Category: ' + d.data.category +
					'<br>Value: ' + d.data.value
				)
					.attr('data-value', d.data.value);
				// move tooltip to the left of cursor for 2nd half of svg
				let tooltipWidth = tooltip.node().getBoundingClientRect().width;
				// let tooltipWidth = tooltip._groups[0][0].clientWidth; also works
				tooltip
					.style("left", ((d3.event.pageX < width / 2) ? 10 + d3.event.pageX :
						d3.event.pageX - tooltipWidth) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on('mouseout', function () {
				tooltip.style('opacity', 0);
			});


		cell.append("text")
			.attr('class', 'tile-text')
			.selectAll("tspan")
			.data(d => wrap(d)) // key function is passed datum that is already assigned to each element
			.enter().append("tspan")
			.attr("x", 4)
			.attr("y", function (d, i) { return 13 + i * (fontSize + 1); })
			.text(function (d) { return d; })
			.style("font-size", fontSize)
			.style('pointer-events', 'none')


		// word wrap function inspired by https://bl.ocks.org/mbostock/7555321
		// TODO: rewrite without appending tspan. (find more efficient way)
		function wrap(leaf) {
			let text = leaf.data.name,
				words = text.split(/\s+/).reverse(),
				width = leaf.x1 - leaf.x0,
				word,
				line = [],
				lines = [],
				tspan = d3.select('.tile-text').append('tspan');
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "))
				if (tspan.node().getComputedTextLength() > width) {
					line.pop()
					tspan.text(line.join(" "))
					lines.push(line);
					line = [word]
				}
			}
			tspan.remove();
			lines.push(line);

			return lines.map(line => line.join(" "));
		}

		/* color legend */
		const LEGEND_OFFSET = 15,
			LEGEND_RECT_SIZE = 15,
			LEGEND_V_SPACING = 10,
			LEGEND_TEXT_X_OFFSET = 3,
			LEGEND_TEXT_Y_OFFSET = -2;
		let legendElemsPerRow = Math.floor(legendWidth / legendSpacing);
		let categories = Array.from(new Set(root.leaves().map(n => n.data.category)));

		const legendItems = legend
			.attr('width', legendWidth)
			.attr('height', Math.ceil(categories.length / legendElemsPerRow) * // total row
				(LEGEND_RECT_SIZE + LEGEND_V_SPACING) + LEGEND_OFFSET)
			.append('g')
			.attr('id', 'legendWrapper')
			.attr('transform', 'translate(' +
				(legendSpacing / legendElemsPerRow) + ',' +
				LEGEND_OFFSET + ')')
			.selectAll('g')
			.data(categories)
			.enter().append('g')
			.attr("transform", (d, i) => {
				return (
					'translate(' +
					(i % legendElemsPerRow) * legendSpacing + ',' +
					(~~(i / legendElemsPerRow)) * (LEGEND_RECT_SIZE + LEGEND_V_SPACING) + ')'
				);
			})
		legendItems.append('rect')
			.attr('width', LEGEND_RECT_SIZE)
			.attr('height', LEGEND_RECT_SIZE)
			.attr('class', 'legend-item')
			.attr('fill', d => colorScaleOrdinal(d));

		legendItems.append('text')
			.attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
			.attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
			.text(d => d);

	}



	function updateDimensions(winWidth) {

		/* breakpoints */
		const
			xs = winWidth <= 576,
			sm = winWidth > 576 && winWidth <= 768;
		md = winWidth > 768 && winWidth <= 992;
		lg = winWidth > 992 && winWidth <= 1200;
		xl = winWidth > 1200;


		if (xs) {
			width = winWidth - 20;
			height = (600 * 600) / width;
			fontSize = 9;
			legendWidth = width * .7;
			legendSpacing = ~~(legendWidth / 2);
		} else if (sm) {
			width = winWidth - 40;
			height = (760 * 650) / width;
			fontSize = 10;
			legendWidth = width * .7;
			legendSpacing = ~~(legendWidth / 3);
		} else if (md) {
			width = winWidth - 60;
			height = (960 * 650) / width;
			fontSize = 11;
			legendWidth = width * .7;
			legendSpacing = ~~(legendWidth / 3);
		} else if (lg) {
			width = winWidth - 60;
			height = (960 * 690) / width;
			fontSize = 11;
			legendWidth = width * .7;
			legendSpacing = ~~(legendWidth / 4);
		} else {
			width = 1250;
			height = 1000 * 700 / 1250;
			fontSize = 11;
			legendWidth = width * .7;
			legendSpacing = ~~(legendWidth / 4);
		}
	}

	function wrap(text) {


	}

	return { render: render };

})();

function resize() {

	d3.select(mapWrapper).remove()
	d3.select('#legendWrapper').remove()
	Chart.render();
}

window.addEventListener('resize', resize)








