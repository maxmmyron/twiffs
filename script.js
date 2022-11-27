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
 * @param {HTMLElement} node tweet node
 */
const appendDiffButton = (node) => {
  node.setAttribute("data-diff", "true");

  tweets.push(node.querySelector("div[lang] > span").innerHTML);

  const iconGroup = node.querySelector("div[role='group']");
  // clone share button as basis for diff button
  const diffButton = iconGroup.lastChild.cloneNode(true);

  // update aria labels
  diffButton.firstChild.firstChild.setAttribute("aria-label", "Diff Tweet");
  diffButton.firstChild.firstChild.removeAttribute("aria-expanded");
  diffButton.firstChild.firstChild.removeAttribute("aria-haspopup");

  // update icon
  diffButton.firstChild.firstChild.firstChild.firstChild.children[1].innerHTML = `<path fill-rule="evenodd" d="M9.24264 1.79736L7.82843 3.21158L9.61685 5L7.25 5C5.45507 5 4 6.45507 4 8.25L4 15.1707C2.83481 15.5825 2 16.6938 2 18C2 19.6569 3.34315 21 5 21C6.65685 21 8 19.6569 8 18C8 16.6938 7.16519 15.5825 6 15.1707L6 8.25C6 7.55964 6.55964 7 7.25 7L9.69686 7L7.82843 8.86843L9.24264 10.2826L13.4853 6.04L9.24264 1.79736ZM5 17C4.44772 17 4 17.4477 4 18C4 18.5523 4.44772 19 5 19C5.55228 19 6 18.5523 6 18C6 17.4477 5.55228 17 5 17Z"/><path fill-rule="evenodd" d="M16 6C16 7.30621 16.8348 8.41745 18 8.82929V15.75C18 16.4404 17.4404 17 16.75 17H14.4542L16.2426 15.2116L14.8284 13.7973L10.5858 18.04L14.8284 22.2826L16.2426 20.8684L14.3742 19H16.75C18.5449 19 20 17.5449 20 15.75V8.82929C21.1652 8.41745 22 7.30621 22 6C22 4.34314 20.6569 3 19 3C17.3431 3 16 4.34314 16 6ZM20 6C20 6.55228 19.5523 7 19 7C18.4477 7 18 6.55228 18 6C18 5.44771 18.4477 5 19 5C19.5523 5 20 5.44771 20 6Z"/>`;

  // parseFromString returns HTMLDocument, so go through DOM to get the element we want
  iconGroup.appendChild(diffButton);
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
