const lcs = (a, b) => {
  let mat = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(""));

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        mat[i][j] = mat[i - 1][j - 1] + a[i - 1];
      } else {
        mat[i][j] = mat[i - 1][j].length > mat[i][j - 1].length ? mat[i - 1][j] : mat[i][j - 1];
      }
    }
  }

  return mat[a.length][b.length];
};

const diff = (a, b) => {
  a = a.split(" ");
  b = b.split(" ");

  let LCS = lcs(a, b);

  let lcsVal = 0;

  // gets difference between a and lcs
  let aDiffs = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === LCS.substring(lcsVal, lcsVal + a[i].length)) {
      aDiffs.push(a[i]);
      lcsVal += a[i].length;
    } else {
      aDiffs.push(`<span class="highlight red">${a[i]}</span>`);
    }
  }

  lcsVal = 0;

  // gets difference between b and lcs
  let bDiffs = [];
  for (let i = 0; i < b.length; i++) {
    if (b[i] === LCS.substring(lcsVal, lcsVal + b[i].length)) {
      bDiffs.push(b[i]);
      lcsVal += b[i].length;
    } else {
      bDiffs.push(`<span class="highlight green">${b[i]}</span>`);
    }
  }

  return [aDiffs, bDiffs];
};

const handleDOMChange = () => {
  const tweets = document.querySelectorAll("article[role=article] div[lang] > span:not([data-diffed])");

  console.log(tweets);

  if (tweets.length == 0) return;

  // add diffed class to tweets so we don't diff again
  tweets.forEach((el) => {
    el.setAttribute("data-diffed", "true");
    // set color to white. the regular gray is ugly anyways.
    el.style.color = "white";
  });

  // final double array of tweets with diff highlighting
  let tweetDiffs = [];

  for (let i = 1; i < tweets.length; i++) {
    const olderTweet = tweets[i].innerHTML;
    const newerTweet = tweets[i - 1].innerHTML;

    // compare older tweet to newer one, and get diffs.
    let [olderDiff, newerDiff] = diff(olderTweet, newerTweet);

    tweetDiffs = [olderDiff, newerDiff, ...tweetDiffs];
  }

  // compact tweets
  for (let i = 1; i < tweetDiffs.length - 1; i += 2) {
    const equivDiffA = tweetDiffs[i];
    const equivDiffB = tweetDiffs[i + 1];

    // combine diffs based on word equivalence
    for (let j = 0; j < equivDiffA.length; j++) {
      if (equivDiffA[j] !== equivDiffB[j]) {
        // if substring of A/B has <span class="highlight red">, and other tweet has <span class="highlight green">, then combine them into one <span class="highlight yellow">.
        if (equivDiffA[j].includes(`<span class="highlight red">`) && equivDiffB[j].includes(`<span class="highlight green">`)) {
          equivDiffA[j] = equivDiffA[j].replace(`<span class="highlight red">`, `<span class="highlight purple">`);
        } else if (equivDiffB[j].includes(`<span class="highlight red">`) && equivDiffA[j].includes(`<span class="highlight green">`)) {
          equivDiffA[j] = equivDiffA[j].replace(`<span class="highlight green">`, `<span class="highlight purple">`);
        }

        // if substring of A/B has <span class="highlight red/green">, and other doesn't have a span, take the longer word.
        if (equivDiffB[j].includes(`<span class="highlight red">`) && !equivDiffA[j].includes(`<span class="highlight`)) {
          equivDiffA[j] = equivDiffB[j];
        } else if (equivDiffB[j].includes(`<span class="highlight green">`) && !equivDiffA[j].includes(`<span class="highlight`)) {
          equivDiffA[j] = equivDiffB[j];
        }
      }
    }

    // equivDiffA is combined, so replace it with the combined version.
    tweetDiffs[i] = equivDiffA;

    // remove the next tweet, since it's been combined.
    tweetDiffs.splice(i + 1, 1);

    // decrement i, since we removed an element.
    i--;
  }

  console.log(tweetDiffs);

  for (let i = tweets.length - 1; i > 0; i--) {
    tweets[tweets.length - 1 - i].innerHTML = tweetDiffs[i].join(" ");
  }
};

const injectCSS = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .highlight {
      border-radius: 2px;
    }

    .highlight.red {
      background-color: rgba(237,84,84,0.40);
    }

    .highlight.green {
      background-color: rgba(20,195,72,0.40);
    }

    .highlight.purple {
      background-color: rgba(188,76,233,0.40);
    }
  `;

  document.head.appendChild(style);
};

const main = () => {
  const observer = new MutationObserver((mutations, observer) => {
    const headings = document.querySelectorAll("h2[role=heading]");

    for (let mutation of mutations) {
      if (mutation.type === "childList") {
        if (headings.length >= 2 ? headings[1].children[0].innerHTML : "" === "Edit History") {
          handleDOMChange();
        }
      }
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};

injectCSS();
main();
