// ==UserScript==
// @name         宿房网后台新闻编辑器功能增强
// @license      GPL-3.0 License
// @namespace    https://github.com/QIUZAIYOU/0557FDC-EditorEnhanced
// @version      0.14
// @description  宿房网后台新闻编辑器功能增强,自动优化标题及描述,扩展排版功能
// @author       QIAN
// @match        https://www.0557fdc.com/admin/*
// @icon         https://www.0557fdc.com/admin/favicon.ico
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  // 选择要观察的节点
  const callback = (mutationsList, observer) => {
    const isAdded = (() => {
      let flag = false;
      return () => {
        if (flag) return true;
        flag = true;
        return false;
      };
    })();
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const {
          addedNodes
        } = mutation;
        for (let node of addedNodes) {
          if (node.classList && node.classList.contains("tox-dialog-wrap") && !isAdded()) {
            formtNewsContentSetting()
          }
          if (node.classList && node.classList.contains("tox-tinymce") && !isAdded()) {
            const newsSaveButton = getButtonByText(".el-dialog", ".el-button", "span", "保存")
            newsSaveButton.addEventListener("click", () => {
              formtNewsInformation("[role='dialog']")
            }, true)
          }
        }
      }
    }
  };
  const targetNode = document.body;
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, {
    childList: true,
    subtree: true
  });
  // 工具类函数
  function setInputValue (element, value) {
    element.value = value;
    element.dispatchEvent(new Event("input", {
      bubbles: false,
      cancelable: true
    }));
  }

  function htmlToNode (htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString.trim();
    return tempDiv;
  };

  function appendHTMLString (parentSelector, htmlString) {
    const parentDom = document.querySelector(parentSelector);
    if (parentDom ?? false) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString.trim();
      const node = tempDiv.firstChild;
      parentDom.appendChild(node)
    }
  }

  function getButtonByText (parentSelector, selfSelector, childSelector, text) {
    const parentDom = document.querySelector(parentSelector);
    const allButtons = parentDom.querySelectorAll(selfSelector);
    let targetButton;
    allButtons.forEach(button => {
      const childButtons = button.querySelectorAll(childSelector)
      childButtons.forEach(child => {
        const childText = child.textContent.trim();
        if (childText === text) {
          targetButton = button;
          return;
        }
      })
    });
    return targetButton || null;
  }

  function createButton (id, label, title, svgContent, style = "") {
    return `<button id="${id}" class="tox-tbtn" aria-label="${label}" title="${title}" type="button" tabindex="-1" aria-disabled="false" style="${style}">
      <span class="tox-icon tox-tbtn__icon-wrap">
        <svg class="icon" viewBox="0 0 1024 1024" width="24" height="24">
          ${svgContent}
        </svg>
      </span>
    </button>`;
  }

  function copyToClipboard (txt) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(function () {
        alert("复制成功！");
      }, function () {
        alert("复制失败！");
      });
    } else if (window.clipboardData) {
      window.clipboardData.clearData();
      window.clipboardData.setData("Text", txt);
      alert("复制成功！");
    } else {
      alert("浏览器不支持复制到剪贴板！");
    }
  }
  // 执行类函数
  const inlineElement = ["SPAN", "STRONG", "EM"]

  function formtNewsContentSetting () {
    const editor_iframe = document.querySelector(".tox-edit-area>iframe").contentWindow.document.querySelector("#tinymce")
    const newsTextarea = document.querySelector(".tox-form textarea.tox-textarea");
    let newsHTML = newsTextarea.value;
    const virtualElement = createVirtualElement(newsHTML);
    const clearedHtml = removeAllIdAndClassAndDataAttrs(virtualElement)
    editor_iframe.innerHTML = clearedHtml.innerHTML;
    newsTextarea.value = clearedHtml.innerHTML;
    const removeAllEmptyParagraphsButton = createButton("removeAllEmptyParagraphsButton", "清除空段", "清除空段", `<path d="M328.832 496.939l-151.467-80.811a17.067 17.067 0 0 1 13.398-31.275l217.642 72.278-79.573 39.808zm214.4 114.346l155.179-57.898 96.554 32.085h-.085a149.376 149.376 0 0 1-48.213 290.73A149.333 149.333 0 0 1 617.94 651.137l-74.666-39.85zm203.435 51.627a64 64 0 1 0 0 128 64 64 0 0 0 0-128z" opacity=".3"/><path d="M746.667 384a64 64 0 1 0 0-128 64 64 0 0 0 0 128zM617.94 395.776a149.333 149.333 0 1 1 176.939 65.621h.085L190.72 662.016a17.067 17.067 0 0 1-13.397-31.275l440.576-234.965z"/>`, "margin:0")
    const removeBackgroundButton = createButton("removeBackgroundButton", "清除背景图片", "清除背景图片", `<path d="M728.363 313.301l-60.331-60.288L517.12 403.797l60.373 60.374L728.32 313.3zm90.496 30.166L215.467 946.859a42.667 42.667 0 0 1-60.331 0L34.475 826.197a42.667 42.667 0 0 1 0-60.33l603.392-603.392a42.667 42.667 0 0 1 60.33 0L818.86 283.136a42.667 42.667 0 0 1 0 60.33z"/><path d="M746.667 512h42.666a21.333 21.333 0 0 1 21.334 21.333V576a21.333 21.333 0 0 1-21.334 21.333h-42.666A21.333 21.333 0 0 1 725.333 576v-42.667A21.333 21.333 0 0 1 746.667 512zm128-128h42.666a21.333 21.333 0 0 1 21.334 21.333V448a21.333 21.333 0 0 1-21.334 21.333h-42.666A21.333 21.333 0 0 1 853.333 448v-42.667A21.333 21.333 0 0 1 874.667 384zm42.666 170.667H960A21.333 21.333 0 0 1 981.333 576v42.667A21.333 21.333 0 0 1 960 640h-42.667A21.333 21.333 0 0 1 896 618.667V576a21.333 21.333 0 0 1 21.333-21.333z" opacity=".3"/>`)
    const handleImageStyleButton = createButton("handleImageStyleButton", "图片处理", "图片处理(仅适用于简单排版)", `<path d="M256 213.333h512a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128v-384a128 128 0 0 1 128-128zm-42.667 512h384l-192-256-192 256zm469.334-128a128 128 0 1 0 0-256 128 128 0 0 0 0 256z"/>`)
    const insertBlankElementButton = createButton("insertBlankElementButton", "插入空段", "插入空段", `<path d="M490.667 213.333h298.666a64 64 0 0 1 0 128H490.667a64 64 0 0 1 0-128zm-256 512h554.666a64 64 0 0 1 0 128H234.667a64 64 0 0 1 0-128zm0-256h554.666a64 64 0 0 1 0 128H234.667a64 64 0 0 1 0-128z" opacity=".3"/><path d="M206.037 401.408L328.661 294.4a21.333 21.333 0 0 0 .086-32.128L206.08 154.624a21.333 21.333 0 0 0-35.413 16.043V385.28a21.333 21.333 0 0 0 35.37 16.128z"/>`)
    const adjustLineHeightButton = createButton("adjustLineHeightButton", "调整行高", "调整行高", `<path d="M85.333 490.667a64 64 0 0 0 64 64h725.334a64 64 0 0 0 0-128H149.333a64 64 0 0 0-64 64z"/><path d="M405.333 853.333a64 64 0 0 1 0-128h469.334a64 64 0 0 1 0 128H405.333zm256-597.333a64 64 0 0 1 0-128h213.334a64 64 0 0 1 0 128H661.333z" opacity=".5"/>`)
    appendHTMLString(".tox-dialog__footer-start", removeAllEmptyParagraphsButton)
    appendHTMLString(".tox-dialog__footer-start", removeBackgroundButton)
    appendHTMLString(".tox-dialog__footer-start", handleImageStyleButton)
    appendHTMLString(".tox-dialog__footer-start", insertBlankElementButton)
    appendHTMLString(".tox-dialog__footer-start", adjustLineHeightButton)
    document.getElementById("removeAllEmptyParagraphsButton").addEventListener("click", () => {
      const domElement = htmlToNode(newsTextarea.value)
      const result = removeAllEmptyParagraphs(domElement)
      editor_iframe.innerHTML = result.innerHTML;
      newsTextarea.value = result.innerHTML;
    })
    document.getElementById("removeBackgroundButton").addEventListener("click", () => {
      const domElement = htmlToNode(newsTextarea.value)
      const result = removeBackgroundImage(domElement)
      editor_iframe.innerHTML = result.innerHTML;
      newsTextarea.value = result.innerHTML;
    })
    document.getElementById("handleImageStyleButton").addEventListener("click", () => {
      const domElement = htmlToNode(newsTextarea.value)
      const result = handleImageStyleIssues(domElement)
      editor_iframe.innerHTML = result.innerHTML;
      newsTextarea.value = result.innerHTML;
    })
    document.getElementById("insertBlankElementButton").addEventListener("click", () => {
      const domElement = htmlToNode(newsTextarea.value)
      const result = insertBlankElementBetweenPAndSection(domElement)
      editor_iframe.innerHTML = result.innerHTML;
      newsTextarea.value = result.innerHTML;
    })
    document.getElementById("adjustLineHeightButton").addEventListener("click", () => {
      const domElement = htmlToNode(newsTextarea.value)
      const result = adjustLineHeight(domElement)
      editor_iframe.innerHTML = result.innerHTML;
      newsTextarea.value = result.innerHTML;
    })
  }

  function formtNewsInformation (parentSelector) {
    const parent = document.querySelector(parentSelector)
    const keywordsRegex  = /(\s|,|，|、)+(宿房网|宿州市)/g;
    const titleRegex = /\s+\||\||\|\s+/g;
    const moreBlankRegex = /\s+/g;
    const noneNecessarySymbol =/\s|，|、/g;
    const title = parent.querySelector("[placeholder='请输入标题']");
    const keywords = parent.querySelector("[placeholder='请输入关键词']");
    const description = parent.querySelector("[placeholder='请输入摘要']");
    const seoTitle = parent.querySelector("[placeholder='请输入seo标题']");
    const seoKeywords = parent.querySelector("[placeholder='请输入seo关键词']");
    const seoDescription = parent.querySelector("[placeholder='请输入seo描述']");
    const titleX = title.value.replace(moreBlankRegex, "").replace(titleRegex, "丨");
    const keywordsX = keywords.value.replace(moreBlankRegex, " ").replace(keywordsRegex,"").replace(noneNecessarySymbol, ",");
    const descriptionX = decodeHTMLEntities(description.value).replace(moreBlankRegex, " ").replace(keywordsRegex,"")
    const seoTitleX = seoTitle.value.replace(moreBlankRegex, "").replace(titleRegex, "丨");
    const seoKeywordsX = seoKeywords.value.replace(moreBlankRegex, " ").replace(keywordsRegex,"").replace(noneNecessarySymbol, ",");
    const seoDescriptionX = decodeHTMLEntities(seoDescription.value).replace(moreBlankRegex, " ").replace(keywordsRegex,"")
    const numberInput = parent.querySelector("input.number-input[type='number']")
    const editor_iframe = parent.querySelector(".tox-edit-area>iframe").contentWindow.document.querySelector("#tinymce")
    setInputValue(title, `${titleX}`);
    setInputValue(keywords, `${keywordsX}`);
    setInputValue(description, `${descriptionX}`);
    setInputValue(seoTitle, `${seoTitleX}`);
    if(keywordsRegex.test(seoKeywords)){
      setInputValue(seoKeywords, `${seoKeywordsX}`);
    }else{
      setInputValue(seoKeywords, `${seoKeywordsX},宿州市,宿房网`);
    }
    setInputValue(seoDescription, `${seoDescriptionX}`);
    if(editor_iframe.innerHTML.includes('<img')) setInputValue(numberInput, 1);
    const yesButton = getButtonByText(".el-radio-group", ".el-radio", "span", "是")
    yesButton.click();
  }

  function decodeHTMLEntities (text) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  }

  function createVirtualElement (dom) {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = dom
    return tempDiv
  }

  function removeAllEmptyParagraphs (dom) {
    const cloneDom = dom.cloneNode(true)
    const elements = cloneDom.querySelectorAll("p,section,span,strong");
    if (elements.length > 0) {
      for (let currentElement of elements) {
        const currentElementHtml = currentElement.innerHTML.replace(/(&nbsp;)+/g, " ").trim()
        if (currentElementHtml === "&nbsp;" || currentElementHtml === "<br>" || currentElementHtml === "") {
          currentElement.remove();
        }
      }
    }
    const blankElements = cloneDom.querySelectorAll(".use-for-blank");
    blankElements.forEach((blankElement) => {
      blankElement.remove()
    })
    return cloneDom;
  }

  function removeBackgroundImage (dom) {
    const cloneDom = dom.cloneNode(true)
    const elements = cloneDom.querySelectorAll("*");
    for (let currentElement of elements) {
      if (currentElement.style.background) {
        const clearedBackground = currentElement.style.background.replace(/url\(.+?\)/g, "");
        currentElement.style.background = clearedBackground;
      }
      if (currentElement.style.backgroundImage) {
        const clearedBackgroundImage = currentElement.style.backgroundImage.replace(/url\(.+?\)/g, "");
        currentElement.style.backgroundImage = clearedBackgroundImage;
      }
    }
    return cloneDom;
  }

  function adjustLineHeight (dom) {
    const clonedDom = dom.cloneNode(true);
    const elements = clonedDom.getElementsByTagName("*");
    for (let currentElement of elements) {
      if (currentElement.childNodes.length === 1 && currentElement.childNodes[0].nodeType === Node.TEXT_NODE) {
        currentElement.style.lineHeight = "1.75em";
        if (inlineElement.includes(currentElement.nodeName)) currentElement.style.display = "inherit";
      } else {
        currentElement.style.lineHeight = "";
        currentElement.style.textIndent = "";
      }
    }
    return clonedDom;
  }

  function insertBlankElementBetweenPAndSection (dom) {
    function isRootElement (element) {
      return element.parentNode === element.ownerDocument.documentElement;
    }

    function isLastElement (element, parent) {
      return element === parent.lastElementChild;
    }

    function createBlankDiv () {
      const div = document.createElement("div");
      div.style.height = "15px";
      div.classList.add("use-for-blank");
      return div;
    }

    function removeDuplicateBlankDivs (parent) {
      const divs = parent.querySelectorAll("div.use-for-blank");
      for (let div of divs) {
        if (div.previousElementSibling.classList.contains("use-for-blank")) {
          parent.removeChild(div);
        }
      }
    }
    const cloneDom = dom.cloneNode(true);
    const elements = cloneDom.querySelectorAll("p, section");
    for (let currentElement of elements) {
      const parent = currentElement.parentNode;
      if (!isRootElement(currentElement) && !isLastElement(currentElement, parent)) {
        const div = createBlankDiv();
        parent.insertBefore(div, currentElement.nextSibling);
        // 移除相邻的重复元素
        removeDuplicateBlankDivs(parent);
      }
    }
    return cloneDom;
  }

  function removeAllIdAndClassAndDataAttrs (dom) {
    const cloneDom = dom.cloneNode(true)
    const elements = cloneDom.querySelectorAll("*");
    for (let currentElement of elements) {
      const clearedStyle = currentElement.style.cssText.replace(/ |!important/g, '')
      currentElement.style = clearedStyle;
      if (currentElement.className !== "use-for-blank") currentElement.removeAttribute("class");
      currentElement.removeAttribute("id");
      // 清除HTML元素上的所有data属性
      const dataAttrs = currentElement.dataset;
      for (let prop in dataAttrs) {
        if (dataAttrs.hasOwnProperty(prop) && !prop.includes("mce")) {
          // console.log(prop)
          delete dataAttrs[prop];
        }
      }
    }
    return cloneDom;
  }
  function insertImgToAncestor (dom) {
    const clonedDom = dom.cloneNode(true);
    const targetDom = clonedDom.querySelectorAll("p,section");
    const imgElements = clonedDom.querySelectorAll('img:only-child')

    for (let element of imgElements) {
      const clonedImg = element.cloneNode(true)
      let parent = element.parentNode;
      while (parent.nodeName !== 'BODY' && parent.children.length === 1) {
        element = parent;
        parent = parent.parentNode;
      }
      element.innerHTML = ""
      element.appendChild(clonedImg)
    }
    return clonedDom;
  }
  function handleImageStyleIssues (dom) {
    const cloneDom = dom.cloneNode(true)
    // cloneDom = insertImgToAncestor(cloneDom)
    const imgElements = cloneDom.querySelectorAll("img");
    for (let currentImg of imgElements) {
      const currentImgParent = currentImg.parentElement
      // 获取图片原始宽度
      const naturalWidth = currentImg.naturalWidth;
      const styleWidth = currentImg.style.width.replace("px", "");
      // 若原始宽度大于650
      if (naturalWidth >= 650 || styleWidth >= 650) {
        // 如果是，则修改内联CSS的宽度为650px
        currentImg.style.width = "650px";
        currentImg.style.height = "auto";
      } else {
        // 如果不是，则修改内联CSS的宽度为呈现的宽度
        currentImg.style.width = `${styleWidth}px`;
        currentImg.style.height = "auto";
      }
      if (naturalWidth < 650 && styleWidth === "100%") {
        currentImg.style.width = `100%`;
        currentImg.style.height = "auto";
      }
      currentImg.style.display = ""
      currentImg.style.margin = ""
      currentImg.style.verticalAlign = "middle"
      currentImgParent.style.textIndent = ""
      if (!inlineElement.includes(currentImgParent.nodeName)) currentImgParent.style.textAlign = "center"
    }
    return cloneDom;
  }
})();
