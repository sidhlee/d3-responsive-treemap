# d3-responsive-treemap

1. You can add multiple links to the data sources and render them with the same d3 chart.  
   e.g.) Links to the data from different months. Rendered through the same chart.

2. You can generate custom colors for scale at [Colorgorical](http://vrl.cs.brown.edu/color)  

3. Relative URL (starting without '/') in href attribute is appended to the current host.  
   You can link search params and parse the value interactively using `new URLSearchParams(window.location.search')`.  

4. To make d3 chart responsive, add listener to `window` for `resize` event.  
   In the handler function, you have to remove old svg before rendering new one, then call rendering function.  
   
5. The main 'Chart' function is invoked the first time using IFFE.  
   It is divided into 3 functions: `init`, `render` and `updateDimension`.  

6. `init` is called inside `then` after fetching data.   
   Initialize anything needed for the chart. (e.g. scales, tooltip, factory functions, axis, selecting and appending...)
   Things that need to be updated with window resize goes into `render` function.  
   After initializing everything, call `render`.
   
7. Inside `render` call `updateDimensions` right away passing `window.innerWidth`.
   After that, set dimensions for `svg` and chart components. Then, the usual chart drawing and tool-tipping.
   DIY'd conditioanl tooltip positioning and word-wrapping function for labels.(mostly for passing test, but use libraries when appropriate.)

8. Ordinal scale's domain is set automatically when calling the scale function with arbitrary value to get colors (or any discrete value in the range).  
   This is very convenient for creating legend. Just join the data you passed into the scale and whatever range value bound to that domain value will return.
   
9. Positioning legend items is done by joing data (domain) and transforming each with index. `i % cols` for column. `i/cols` for row.  

10. In `updateDimensions` function, you can set breakpoints and use current innerWidth to 
conditionally update chart-width, height, font-size, legend-width. legend-spacing, etc...

11. At the end oh `Chart` function, you can return an object filled with functions or props that you will need later (e.g. re-rendering).
