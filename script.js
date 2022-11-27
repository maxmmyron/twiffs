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

/**
 * Contains tweets on history page, in order of newest -> oldest.
 */
const tweets = [];

/**
 *
 * @param {HTMLElement} node
 */
const appendDiffButton = (node) => {
  node.setAttribute("data-diff", "true");

  const tweetText = node.querySelector("div[lang] > span").innerHTML;
  tweets.push(tweetText);
};

const main = () => {
  // check for mutations to document
  const observer = new MutationObserver((mutations, observer) => {
    try {
      // check if we are on the edit history page
      if (/http(s)?:\/\/(www.)?twitter.com\/(.){4,15}\/status\/(.)*\/history/.test(window.location.href)) {
        for (let mutation of mutations) {
          if (mutation.type === "attributes") {
            // get all blocks that haven't been handled yet
            if (mutation.target.getAttribute("role") == "article" && !mutation.target.getAttribute("data-diff")) {
              appendDiffButton(mutation.target);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

main();
