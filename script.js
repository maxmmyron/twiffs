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
 * @returns {HTMLElement}
 */
const createElementWithProperties = (type, properties) => {
  const el = document.createElement(type);
  for (const [key, value] of Object.entries(properties)) {
    el[key] = value;
  }
  return el;
};

const diffSVG = `<path fill-rule="evenodd" d="M9.24264 1.79736L7.82843 3.21158L9.61685 5L7.25 5C5.45507 5 4 6.45507 4 8.25L4 15.1707C2.83481 15.5825 2 16.6938 2 18C2 19.6569 3.34315 21 5 21C6.65685 21 8 19.6569 8 18C8 16.6938 7.16519 15.5825 6 15.1707L6 8.25C6 7.55964 6.55964 7 7.25 7L9.69686 7L7.82843 8.86843L9.24264 10.2826L13.4853 6.04L9.24264 1.79736ZM5 17C4.44772 17 4 17.4477 4 18C4 18.5523 4.44772 19 5 19C5.55228 19 6 18.5523 6 18C6 17.4477 5.55228 17 5 17Z"/><path fill-rule="evenodd" d="M16 6C16 7.30621 16.8348 8.41745 18 8.82929V15.75C18 16.4404 17.4404 17 16.75 17H14.4542L16.2426 15.2116L14.8284 13.7973L10.5858 18.04L14.8284 22.2826L16.2426 20.8684L14.3742 19H16.75C18.5449 19 20 17.5449 20 15.75V8.82929C21.1652 8.41745 22 7.30621 22 6C22 4.34314 20.6569 3 19 3C17.3431 3 16 4.34314 16 6ZM20 6C20 6.55228 19.5523 7 19 7C18.4477 7 18 6.55228 18 6C18 5.44771 18.4477 5 19 5C19.5523 5 20 5.44771 20 6Z"/>`;
const closeSVG = `<path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />`;

//Contains tweets on history page, in order of newest -> oldest.
let tweets = [];

let initialTweetIndex = -1;
let compareTweetIndex = -1;

let lcsRes = "";

const createTweet = (tweetIndex, canSelect = true) => {
  const tweetEl = createElementWithProperties("div", { innerHTML: tweets[tweetIndex], className: `diff-tweet ${!canSelect && "diff-tweet-disabled"}` });
  tweetEl.appendChild(document.createElement("br"));

  if (canSelect) {
    tweetEl.addEventListener("click", () => {
      compareTweetIndex = tweetIndex;
      // we want to compare older to newer so reverse args if initial is older than this index
      if (initialTweetIndex < compareTweetIndex) lcsRes = lcs(tweets[compareTweetIndex], tweets[initialTweetIndex]);
      else lcsRes = lcs(tweets[initialTweetIndex], tweets[compareTweetIndex]);

      // destroy old modal
      document.querySelector(".diff-modal-container")?.remove();

      // create modal, populate with diff results
      document.getElementById("layers").appendChild(populateDiffResultModal(createModal("Tweet diff")));
    });
  }

  return tweetEl;
};

const createModal = (title) => {
  document.documentElement.style.overflowY = "hidden";

  const modalContainer = createElementWithProperties("div", { className: "diff-modal-container", role: "dialog", ariaModal: "true" });
  modalContainer.style.transform = `translateY(${window.scrollY}px)`;

  modalContainer.addEventListener("click", (e) => {
    if (e.target === modalContainer) {
      modalContainer.remove();
      document.documentElement.style.overflowY = "auto";
    }
  });

  const modal = createElementWithProperties("div", { className: "diff-modal" });

  const modalHeader = createElementWithProperties("div", { className: "diff-modal-header" });

  const closeContainer = createElementWithProperties("div", { className: "diff-modal-close-container" });

  const closeEl = createElementWithProperties("div", { className: "diff-modal-close" });
  closeEl.addEventListener("click", () => {
    modalContainer.remove();
    document.documentElement.style.overflowY = "auto";
  });

  const closeSVGEl = `<svg class="diff-modal-close-svg" aria-hidden="true" viewBox="0 0 24 24">${closeSVG}</svg>`;

  closeEl.innerHTML = closeSVGEl;
  closeContainer.appendChild(closeEl);

  modalHeader.appendChild(closeContainer);
  modalHeader.appendChild(createElementWithProperties("h2", { innerHTML: title, className: "diff-modal-title" }));
  modal.appendChild(modalHeader);
  modal.appendChild(createElementWithProperties("div", { className: "diff-modal-content" }));
  modalContainer.appendChild(modal);

  return modalContainer;
};

/**
 * @param {HTMLElement} node tweet node
 */
const appendDiffButton = (node) => {
  node.setAttribute("data-diff", "true");

  const tweetText = node.querySelector("div[lang] > span").innerHTML;
  const newTweetIndex = tweets.push(tweetText) - 1;

  /**
   * @type {HTMLElement}
   */
  const diffButton = node.querySelector("div[role='group']").lastChild.cloneNode(true);
  node.querySelector("div[role='group']").appendChild(diffButton);

  diffButton.firstChild.firstChild.setAttribute("aria-label", "Diff Tweet");
  diffButton.firstChild.firstChild.removeAttribute("aria-expanded");
  diffButton.firstChild.firstChild.removeAttribute("aria-haspopup");

  diffButton.querySelector("svg").innerHTML = diffSVG;

  diffButton.addEventListener("mouseenter", () => {
    diffButton.querySelector("[dir]").classList.add("diff-color");
    diffButton.querySelector("[dir]").firstChild.firstChild.classList.add("diff-bg-color");
  });

  diffButton.addEventListener("mouseleave", () => {
    diffButton.querySelector("[dir]").classList.remove("diff-color");
    diffButton.querySelector("[dir]").firstChild.firstChild.classList.remove("diff-bg-color");
  });

  diffButton.addEventListener("click", () => {
    initialTweetIndex = newTweetIndex;
    // override body scroll

    // create modal, populate with other available tweets (take from tweets array)
    document.getElementById("layers").appendChild(populateDiffInputModal(createModal("Compare tweets"), newTweetIndex));
  });
};

const populateDiffInputModal = (modal, tweetIndex) => {
  const modalBody = modal.querySelector(".diff-modal-content");

  const newerTweetHeading = createElementWithProperties("h3", { innerHTML: "Newer Tweets" });
  const olderTweetHeading = createElementWithProperties("h3", { innerHTML: "Older Tweets" });

  for (let i = 0; i < tweets.length; i++) {
    if (i != tweetIndex) {
      modalBody.appendChild(createTweet(i));
      continue;
    }

    i > 0 && modalBody.appendChild(newerTweetHeading);
    modalBody.appendChild(createTweet(i, false));
    i < tweets.length - 1 && modalBody.appendChild(olderTweetHeading);
  }

  return modal;
};

const populateDiffResultModal = (modal) => {
  const modalBody = modal.querySelector(".diff-modal-content");

  const initialEl = createElementWithProperties("div", { innerHTML: tweets[initialTweetIndex], className: "diff-tweet diff-tweet-disabled" });
  const compareEl = createElementWithProperties("div", { innerHTML: tweets[compareTweetIndex], className: "diff-tweet diff-tweet-disabled" });

  const diffEl = createElementWithProperties("div", { className: "diff-modal-diff", innerHTML: lcsRes });

  modalBody.appendChild(initialEl);
  modalBody.appendChild(compareEl);
  modalBody.appendChild(document.createElement("hr"));
  modalBody.appendChild(diffEl);

  return modal;
};

const main = () => {
  let lastHref = window.location.href;

  // check for mutations to document
  const observer = new MutationObserver((mutations, observer) => {
    try {
      // check if we are on the edit history page
      if (/http(s)?:\/\/(www.)?twitter.com\/(.){4,15}\/status\/(.)*\/history/.test(window.location.href)) {
        // check if we are on a new page
        if (lastHref !== window.location.href) {
          lastHref = window.location.href;
          tweets = [];
          initialTweetIndex = -1;
          compareTweetIndex = -1;
          // remove modals
          document.querySelectorAll(".diff-modal-container").forEach((el) => el.remove());
        }

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
