# Freesound Loop Generator

The **Freesound Loop Generator** (FLG) is a tool to create music loops using Freesound sounds. It contains a 16 pads, 
a simple 16-step sequencer and several methods to load Freesound sounds into the pads. FLG allows you to export
the loops you make as WAV files and also allows you to download the sounds loaded in each pad rendered as a single
32-seconds long WAV file with sounds spaced every 2 seconds so you can easily load the sounds in your sampler of chocie. 
The sequences made in FLG can also be exported as MIDI files so you can recreate the loops in your favorite
software.

For sound examples you can check [this pack of sounds](https://freesound.org/people/frederic.font/packs/28449/) in Freesound. 
Also you can use the tool here https://ffont.github.io/freesound-loop-generator/

FLG is a newer version (2020 update) of the old **FreeMaschine!** hack developed by Javi Agenjo, Bram de Jong and Frederic 
Font at Barcelona Music Hack Day 2014 ([see video here](https://www.youtube.com/watch?v=NCYBjv2wDAw)). It includes a bit 
(not too much) of code refactoring, but most of the code is still pretty old and probably contains many bugs.


## License 

FLG source code is released under MIT license. FLG uses the following 3rd party libraries:

* [Recorderjs](https://github.com/mattdiamond/Recorderjs) by Matt Diamond (MIT licensed)
* [jsmidigen](https://github.com/dingram/jsmidgen) by Dave Ingram (MIT licensed)
* [bootstrap](https://getbootstrap.com) by Twitter, Inc (MIT Licensed)
* [jquery](https://jquery.com) by jQuery foundation (MIT licensed)
