# twiffs

twiffs is a browser extension that a native-like experience for showing diff highlighting for edited tweets.

![twiffs demo gif](./demo.gif)

twiffs uses a dynamic programming solution to the [LCS](https://en.wikipedia.org/wiki/longest_common_subsequence_problem) problem to find the common subsequence between two selected tweets, and highlights them accordingly.

By leveraging native twitter elements, twiffs has a near-native feeling to it.

## Installation

### Chromium

1. Download the latest chrome release from the [releases page](

### Firefox

Install the [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/twiffs/)

## Usage

1. Navigate to the edit history for any tweet that has been edited.

2. Click the diff icon on any older tweet.

   ![A custom diff icon highlighted on a tweet card.](./sample.png)

3. Choose a newer tweet to compare the selected tweet against.

   ![A modal showing a number of tweets against which the selected tweet can be compared.](./sample_input.png)

4. See the diff highlighted between the two selected tweets!

   ![A modal showing a highlighted difference between two tweets.](./sample_output.png)
