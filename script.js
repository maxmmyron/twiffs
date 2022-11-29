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
const createElementWithProperties = (tag, properties) => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(properties)) {
    el[key] = value;
  }
  return el;
};

//Contains tweets on history page, in order of newest -> oldest.
let tweets = [];
let tweetNodes = [];

let currentTweetIndex = -1;
let newerTweetIndex = -1;

let lcsRes = "";

const constructDiffHighlight = (tweetText, isOriginal) => {
  let res = document.createElement("span");

  let tweetSplit = tweetText.split(" ");
  let lcsSplit = lcsRes.split(" ");

  for (let i = 0; i < tweetSplit.length; i++) {
    let j = i;

    while (j < lcsSplit.length) {
      if (tweetSplit[i] === lcsSplit[j]) break;
      j++;
    }

    if (j >= lcsSplit.length) {
      let span = document.createElement("span");
      span.classList.add(`diff-${isOriginal ? "remove" : "add"}`);
      span.innerText = tweetSplit[i] + " ";
      res.appendChild(span);
    } else res.appendChild(document.createTextNode(tweetSplit[i] + " "));
  }

  return res;
};

const createTweet = (tweetIndex, canSelect = false, isDisabled = false) => {
  /**
   * @type {HTMLElement}
   */
  let tweetNode = tweetNodes[tweetIndex].cloneNode(true);

  // remove tweet actions
  tweetNode.querySelector("div[role='group']").parentElement.remove();
  // remove tweet options container
  tweetNode.querySelector("div[aria-label='More']").parentElement.parentElement.parentElement.parentElement.remove();

  // replace twitter hover class with custom class (since twitter one freezes on cloneNode)
  tweetNode.classList.remove(tweetNode.classList[1]);
  tweetNode.classList.add("diff-tweet");

  // add custom class to denote tweet text for easier selection
  let tweetTextNode = tweetNode.querySelector("div[data-testid='tweetText']");

  // set tweet text color
  tweetTextNode.classList.add(`diff-tweet-text`);

  // remove images (if exists)
  tweetTextNode.parentElement.parentElement.children[1]?.remove();

  // remove thread link (if exists)
  tweetNode.firstChild.children[1]?.remove();

  tweetNode.querySelectorAll("a").forEach((a) => {
    a.removeAttribute("href");
    //a.setAttribute("href", "javascript:void(0)");
    a.classList.add("diff-tweet-noselect");
  });

  if (isDisabled) tweetNode.classList.add("diff-tweet-disabled");

  if (canSelect) {
    tweetNode.addEventListener("click", () => {
      newerTweetIndex = tweetIndex;
      lcsRes = lcs(tweets[currentTweetIndex], tweets[newerTweetIndex]);

      document.querySelector(".diff-modal-container")?.remove();
      document.getElementById("layers").appendChild(populateDiffResultModal(createModal("Tweet diff")));
      console.log("didd");
    });
  } else tweetNode.classList.add("diff-tweet-noselect");

  return tweetNode;
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

  closeEl.innerHTML = `<svg class="diff-modal-close-svg" aria-hidden="true" viewBox="0 0 24 24"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" /></svg>`;
  closeContainer.appendChild(closeEl);

  modalHeader.appendChild(closeContainer);
  modalHeader.appendChild(createElementWithProperties("h2", { innerHTML: title, className: "diff-modal-title" }));
  modal.appendChild(modalHeader);
  modal.appendChild(createElementWithProperties("div", { className: "diff-modal-content" }));
  modalContainer.appendChild(modal);

  return modalContainer;
};

const populateDiffInputModal = (modal, tweetIndex) => {
  console.log("A");
  const modalBody = modal.querySelector(".diff-modal-content");

  modalBody.appendChild(createElementWithProperties("h2", { innerHTML: "Selected Tweet" }));
  modalBody.appendChild(createTweet(tweetIndex, false, true));
  modalBody.appendChild(createElementWithProperties("h2", { innerHTML: "Newer Tweets" }));

  for (let i = 0; i < tweetIndex; i++) modalBody.appendChild(createTweet(i, true));

  return modal;
};

const populateDiffResultModal = (modal) => {
  const modalBody = modal.querySelector(".diff-modal-content");

  const appendDiffedTweet = (heading, index, isOriginal) => {
    modalBody.appendChild(createElementWithProperties("h2", { innerHTML: heading }));
    const tweetEL = createTweet(index, false, false);

    tweetEL.querySelector("div[data-testid='tweetText']").innerHTML = "";
    tweetEL.querySelector("div[data-testid='tweetText']").appendChild(constructDiffHighlight(tweets[index], isOriginal));

    modalBody.appendChild(tweetEL);
  };

  appendDiffedTweet("Newer Tweet", newerTweetIndex, false);
  appendDiffedTweet("Selected Tweet", currentTweetIndex, true);

  console.log("did");

  return modal;
};

/**
 * @param {HTMLElement} node tweet node
 */
const appendDiffButton = (node) => {
  node.setAttribute("data-diff", "true");

  const tweetText = node.querySelector("div[lang] > span").innerHTML;
  const tweetIndex = tweets.push(tweetText) - 1;
  tweetNodes.push(node);

  // if nothing newer to compare to
  if (tweetIndex === 0) return;

  /**
   * @type {HTMLElement}
   */
  const diffButton = node.querySelector("div[role='group']").lastChild.cloneNode(true);
  node.querySelector("div[role='group']").appendChild(diffButton);

  diffButton.firstChild.firstChild.setAttribute("aria-label", "Diff Tweet");
  diffButton.firstChild.firstChild.removeAttribute("aria-expanded");
  diffButton.firstChild.firstChild.removeAttribute("aria-haspopup");

  diffButton.querySelector(
    "svg"
  ).innerHTML = `<path fill-rule="evenodd" d="M9.24264 1.79736L7.82843 3.21158L9.61685 5L7.25 5C5.45507 5 4 6.45507 4 8.25L4 15.1707C2.83481 15.5825 2 16.6938 2 18C2 19.6569 3.34315 21 5 21C6.65685 21 8 19.6569 8 18C8 16.6938 7.16519 15.5825 6 15.1707L6 8.25C6 7.55964 6.55964 7 7.25 7L9.69686 7L7.82843 8.86843L9.24264 10.2826L13.4853 6.04L9.24264 1.79736ZM5 17C4.44772 17 4 17.4477 4 18C4 18.5523 4.44772 19 5 19C5.55228 19 6 18.5523 6 18C6 17.4477 5.55228 17 5 17Z"/><path fill-rule="evenodd" d="M16 6C16 7.30621 16.8348 8.41745 18 8.82929V15.75C18 16.4404 17.4404 17 16.75 17H14.4542L16.2426 15.2116L14.8284 13.7973L10.5858 18.04L14.8284 22.2826L16.2426 20.8684L14.3742 19H16.75C18.5449 19 20 17.5449 20 15.75V8.82929C21.1652 8.41745 22 7.30621 22 6C22 4.34314 20.6569 3 19 3C17.3431 3 16 4.34314 16 6ZM20 6C20 6.55228 19.5523 7 19 7C18.4477 7 18 6.55228 18 6C18 5.44771 18.4477 5 19 5C19.5523 5 20 5.44771 20 6Z"/>`;

  diffButton.addEventListener("mouseenter", () => {
    diffButton.querySelector("[dir]").classList.add("diff-color");
    diffButton.querySelector("[dir]").firstChild.firstChild.classList.add("diff-bg-color");
  });

  diffButton.addEventListener("mouseleave", () => {
    diffButton.querySelector("[dir]").classList.remove("diff-color");
    diffButton.querySelector("[dir]").firstChild.firstChild.classList.remove("diff-bg-color");
  });

  diffButton.addEventListener("click", () => {
    currentTweetIndex = tweetIndex;
    // override body scroll

    // create modal, populate with other available tweets (take from tweets array)
    document.getElementById("layers").appendChild(populateDiffInputModal(createModal("Compare to Newer Edit"), tweetIndex));
  });
};

const main = () => {
  let lastHref = window.location.href;

  // check for mutations to document
  const observer = new MutationObserver((mutations, observer) => {
    // if href changes, clear tweets array
    if (lastHref !== window.location.href) {
      lastHref = window.location.href;
      tweets = [];
      tweetNodes = [];
      currentTweetIndex = -1;
      newerTweetIndex = -1;
      document.querySelectorAll(".diff-modal-container").forEach((el) => el.remove());
    }

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
