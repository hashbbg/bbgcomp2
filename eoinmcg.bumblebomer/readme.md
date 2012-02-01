BumbleBomber
===========

My entry for the bbgcomp2 challenge; 12 hours to cobble together a game in the style of _bullet-hell/space shooter (a la r-type)_

I made the game specifically for mobile devices in landscape mode (tested on Galaxy S2), but it will work in any modern browser.

I used the code from my whiskey game http://arcade.starfish.ie/whiskey as a starting point.
The code (for whiskey) was written over a year ago and quite a mess, but provided the kickstart I needed, given the incredibly tight 12hour time limit.
I spent about 10hours in total on BumbleBomber and while it's not masterpiece I'm happy with the result. Performance is a big problem on mobile devices, particulary drawing bitmaps to the canvas. With this in mind I use only a bit map sprite for the main character and everything else is composed of circle and rectangles. What has been lost in terms of pretty graphics is gained in speed and the number of entities on the screen.


Plans are afoot to convert it into a fully fledged game, so watch this space. 

The code is open source so feel free to learn from it, fork it and make it even better.

Play the game here: http://arcade.starfish.ie/bumble
