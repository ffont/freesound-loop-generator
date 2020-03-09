# Freesound Loop Generator

The **Freesound Loop Generator** (FLG) is a tool to create music loops using sound from Freesound. It features a simple 16-steps sequencer and 16 pads with several methods to load Freesound sounds into them.  FLG allows you to export the loops you make so you can load them into your samplers, sequencers and your favorite music making software. FLG is available at [https://ffont.github.io/freesound-loop-generator/](https://ffont.github.io/freesound-loop-generator/). Also you can check some sound examples you in [this Freesound pack](https://freesound.org/people/frederic.font/packs/28449/).  

![Freesound Loop Generator screenshot](static/images/flg_screenshot_main.png)

FLG is a newer version (2020 update) of the old **FreeMaschine!** hack developed by Javi Agenjo, Bram de Jong and Frederic Font at Barcelona Music Hack Day 2014 ([see video here](https://www.youtube.com/watch?v=NCYBjv2wDAw)). It includes a bit (not too much) of code refactoring, but most of the code is still pretty old and probably contains many bugs.


## Features

* 16 pads that can load one Freesound sound each and can be played with your computer keyboard
* 5 methods for automatically loading sounds into the pads
* A programable 16-steps sequencer with randomize option and adjustable tempo
* License filter to make sure all sounds you get from Freesound fit your licensing needs
* Export functionalities to easily integrate the generated loops in your music production workflow:
  * Download the generared loop as a `wav` file
  * Download a 32-seconds long `wav` file inluding all the sounds loaded in the pads in a  2-seconds grid
  * Download the step sequencer pattern as a `mid` file 
  * Download attribution files together with the `wav` files which will facilitate Creative Commons attribution requirements


## How to use Freesound Loop Generator

Basically the only thing you should do is wait for some sounds to be loaded in the pads (by default FLG will search for sounds using the keyword *percussion*) and hit Play! But here are some more details of all the different features:


### Loading sounds into the pads

You can load the sounds into the individual pads using one of the 5 modes listed in the top part of the interface, just below the logo:

* **Text query**: use this mode to select sounds to be loaded in the pads based on some query terms. Just add some query terms in the input box (e.g. try with *glass*, *wood*, ...) and click `Search!`

* **By tags**: this mode allows you to select the sound of a specific pad individually. After selecting the mode, click on a pad to display a popover with information about the sound currently loaded in it (if any). Then click in the search icon that will appear next to the file name. A modal will appear with a search box you can use to find new sounds. Preview the sounds using the play buttons that will appear and finaly select the sound you want by clicking on its name. This will load the sound in the pad.
  
	![Search by tag screenshot A](static/images/flg_bytag_comp.png)
  
* **Timeline**: use this mode to load sounds in the pads based on Freesound sounds' popularity in a specific time period. Select a month and a year and your pads will be loaded with the most popular sounds uploaded during that time. This is using a similar algorithm to the one I use for another small Freesound project of mine called [Freesound Timeline](https://ffont.github.io/freesound-timeline/).

* **Similarity**: this mode allows you to replace all the sounds in your pads for other sounds which are acoutically similar. It uses Freesound's *similar sounds* feature. Just select the mode and click `Replace sounds by similarity...`. Sometimes it takes a bit of time for all sounds to be replaced.

* **Random**: well, this one does not need much explanation. Just click `Replace sounds randomly...` and all your pads will load random sounds from Freesound.


In all of the modes, FLG adds a limit to the duration of the sounds that are loaded, only short sounds (less than1  second) are considered.

You can use the **license filter** at the bottom of the interface to limit the licenses of the sounds used in FLG. Select one of the following options:

* **All licenses**: will include CC0, CC-BY and CC-BY-NC sounds.
* **Exclude CC-BY-NC**: will exclude sounds with restricted commercial use. Use that option if you plan to use the loops you make with FLG commercially and are fine giving attribution.
* **Only CC0**: will only search for sounds with CC0 (public domain) license. Use that option if you won't be able to give attribution for the sounds in the loops generated with FLG.


### Using the sequencer

By default FLG loads a random sequence in the 16-steps sequencer. You can *start*, *stop* and set the *tempo* of the sequence using the sequencer controls:
 
![Sequencer controls](static/images/flg_seqcontrols.png)

You can also get a new random sequence by clicking on the *random* button (the crossed arrows):

![Random button](static/images/flg_rndbutton.png)

You can edit the individual steps of the sequenbce by clicking on the *sequencer* button:

![Sequencer button](static/images/flg_seqbutton.png)

This will show a grid of 16x16 that you can use to activate or deactivate the individual steps of the sequence for each of the 16 pads:

![Sequencer](static/images/flg_sequencer.png)

Once in that view, you can click the *pads* button to return to the pads view:

![Pads button](static/images/fig_padsbutton.png)

### Exporting loops, files and sequence

The loops generated by FLG can be exported in several ways:

#### Export loop as WAV file

![Export controls](static/images/flg_export_loop.png)

With the sequencer stopped, set the number of measures you want to export and click on the *record* button. The sequencer will start playing and FLG will record the output. After the numbner of measures are played, the sequencer will stop and FLG will ask you to download a `wav` file with the rendered loop. Together with the audio file, a text file (with `txt` extension) will be downloaded which includes a list of the sounds used in the loop. You can use this list for giving credit to the original sound authors. See an example attribution file below.


```
This audio file was generated using the Freesound Loop Generator
https://labs.freesound.org/freemaschine/

It contains the following Freesound sounds:
 - "SeedB1.wav" by menegass (CC0) - https://freesound.org/s/99716
 - "clap wood fizzle whack.aiff" by splashzooka (Sampling+) - https://freesound.org/s/21836
 - "Walking Percussion 01.wav" by totalcult (CC0) - https://freesound.org/s/388614
 - "Gong - percussion 04" by Jagadamba (CC-BY) - https://freesound.org/s/257194
 - "Winter Closed Hi-hat.wav" by Lynx_5969 (CC0) - https://freesound.org/s/412441
 - "Percussive-001.wav" by simon.danielsson (CC0) - https://freesound.org/s/460701
 - "button_master 029.aif" by gherat (CC0) - https://freesound.org/s/139572
 - "Metal Bucket Percussion" by Jagadamba (CC-BY) - https://freesound.org/s/387672
 - "MetalPerc02.wav" by ra_gun (CC0) - https://freesound.org/s/83375
 - "Cabasa 2_4" by Joao_Janz (CC0) - https://freesound.org/s/482537
 - "distorted percussion 8.wav" by LDNsoundproduction (CC0) - https://freesound.org/s/160899
 - "Whick.wav" by Bitbeast (CC0) - https://freesound.org/s/12722
 - "bottle2.wav" by hoobtastic (CC-BY) - https://freesound.org/s/132634
 - "MiscSoftNaturalGtrLoud2_2.wav" by Vidsyn (CC0) - https://freesound.org/s/113620
 - "Balloon 1" by wuola (CC-BY) - https://freesound.org/s/168265
 - "Guiro 2....124bpm.wav" by juskiddink (CC-BY) - https://freesound.org/s/113623

```

It is also possible to click the reocrding button while the sequencer is playing. This will start recording at the point where the sequencer is and will stop recording after the indicated measures have been played. The sequencer however won't be stopped once the recording finishes. Doing it in this way, the exported audio file won't be syncronized with the sequencer (it won't necessarily start at step 1).

#### Export pad sounds for loading in external sampler

![Export controls](static/images/flg_export_set.png)

Once you have some sounds loaded in the pads, you can use the *export pad sounds* button to download a 32-seconds long audio file which contains the 16 sounds loaded in the pads rendered one after the other in a grid of 2 seconds. Most of the samplers nowadays have some sort of *slice* mode that allow to cut an audio file in regurlarly spaced positions. Use the audio exported using the *slice* feature of your sampler to load and play the individual sounds (see example below with Ableton Live).

When downloading the 32-seconds long audio file, an attribution file will also be downloaded. This file has the same format and contents as described in the section above.


#### Export sequences for loading in external sequencer

![Export controls](static/images/flg_export_seq.png)

Click on the *export midi* button to download a MIDI file (with `mid` extension) that can be loaded in external sequencers or DAWs. This feature used in combination with the *export pad sounds* will allow you to rebuild the same loop you're hearing in FLG in external gear/software. This way you can fine tune and improve it (see the example below with Ableton Live).

#### Example: exporting a FLG loop into Ableton Live

**Step 1:** Create a loop using Freesound Loop Generator and download the MIDI file of the sequence and the rendred set of sounds (use the *export pad* and *export midi* functions described above.

![Files downloaed from FLG](static/images/flg_example_export_files.png)

**Step 2:** Drag the MIDI file to one empty clip slot in an Ableton Libe MIDI track.

![Drag the MIDI clip](static/images/flg_example_drag_mid.png)

If you click on te newly created clip, you should see the same sequence as in FLG. Each note corresponds to one sound of FLG, but the order in Ableton Live is reversed with respect to FLG.

![Drag the MIDI clip](static/images/flg_example_clip.png)

**Step 3:** Drag the WAV file to the *Drag instrument or sample here* placeholder zone in Ableton Live. This will create a *simpler* instrument with FLG's WAV file loaded in it.

![Drag the MIDI clip](static/images/flg_example_drag_wav.png)

Before using it, simpler needs to be configured to use **Slice** mode and to cut the file into **16 evenly spaced regions**. Also the polyphony needs to be set to **16 voices** so that all sounds can be played simultaneously.

![Drag the MIDI clip](static/images/flg_example_sampler.png)

And that's it, you can now hit **Play** and you should hear the same loop as in FLG. Now you'll have all Ableton Live power to mangle samples and further edit the sequence. Some further hints and relevant notes:

 * The MIDI file, when loaded in Ableton Live, sequences notes from `C1` to `D2`. Other sofware/sequencers might map the notes one octave above or below. Just make sure that the notes in the sequencer match with the notes needed by the sampler.
 * Once the WAV file is loaded into simpler and Slice mode is configured, you can right click on the sample and select `Slice to Drum Rack`. This will, you guessed it, replace the Simpler by a Drum Rack with all the samples properly configured. Now you can edit samples individually, add effects, etc. 

 ![Simpler to Drum Rack](static/images/flg_example_drum_rack.png)
 


## License 

FLG source code is released under MIT license. FLG uses the following 3rd party libraries:

* [Recorderjs](https://github.com/mattdiamond/Recorderjs) by Matt Diamond (MIT licensed)
* [jsmidigen](https://github.com/dingram/jsmidgen) by Dave Ingram (MIT licensed)
* [bootstrap](https://getbootstrap.com) by Twitter, Inc (MIT Licensed)
* [jquery](https://jquery.com) by jQuery foundation (MIT licensed)
