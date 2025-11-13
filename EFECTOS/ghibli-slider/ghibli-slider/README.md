# Ghibli Slider

A Pen created on CodePen.

Original URL: [https://codepen.io/cobra_winfrey/pen/jjjero](https://codepen.io/cobra_winfrey/pen/jjjero).

"fantasy" API challenge w/ Studio Ghibli API + SplittingJS + a bunch of stuff that probably only looks ok in Chrome

/edit

by request, here's a quick breakdown of what's happening here:

• slides are generated via calls to Ghibli API found here: https://ghibliapi.herokuapp.com/ - used some JS to wrap some of the smaller title elements in spans to exert a bit more control over text size

• images were manually added and called via JS formatted queries based on film titles (i.e. my-neighbor-totoro.jpg) - initially tried to add them via Wikipedia API but call limit was too restrictive

• duotone filter applied to the images- first image is using CSS filters to desaturate and up the contrast, then pseudo elements are applied to the wrapping element, each with their own background color & z-index, after which CSS mix-blend-mode (in this case multiply & hard-light) is applied for duotone effect

• svg "squigglevision" animation is added to a handful of elements for organic illustrative look- multiple SVG turbulence filters are toggled through at a fraction of a second providing a subtle animated distortion (read more here: https://css-tricks.com/squigglevision-in-css-and-svg/)

• for text reveal, Splitting.js (https://splitting.js.org) is used to wrap a span around each word in the film titles- Splitting does a cool thing by adding data attributes containing the text itself to each span, making it easy to use the text in pseudo elements- in this case, the text itself is transparent, relatively posiitioned and inline-block with overflow hidden, with additional padding & negative margins to offset the padding in order to avoid cropping of characters that fall below the text baseline (Y, Q, etc)- then pseudos utilizing the text's data attributes for content are animated into place, with a SCSS loop to gradually increment/stagger transition times - same general effect is happening with the film release date in the upper righthand corner

• the soot sprites (little dustballs with eyeballs, for the uninitiated) are called once per click and animate into place using CSS offset-path property, which accepts an SVG path for the element to travel along when animating the element's offset-distance property, in this case from 0% to 100% - I've used SCSS' random() function to vary the animation timing function and delay, although JS is probably a nicer option as it's possible to animate on a per-click basis versus compiling only once prior to execution. I frequently reference this Pen by Anthony Dugois to construct my paths: https://codepen.io/anthonydugois/pen/mewdyZ - note that paths use pixel-based measurements so they can be quite touchy (best used for more random/frenetic motion) and aren't exactly responsive.

• the slider is a slider, and yeah I know sliders are junky and it's pretty poorly written w/ JQuery because I'm just more efficient that way- all told all of the JS could be cleaned up considerably but this demo is just a fun distraction and I just don't have the time to concern myself with cruft (or accessibility or cross-browser compatibility, which are significantly more important)

closing note, I'd mention the real trick to making something work in this capacity is spending some time dialing in the animations/transitions, both the easing functions (play around with cubic-beziers) and the timing offsets