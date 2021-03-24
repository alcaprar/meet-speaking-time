chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  try {
    if (request.join) {
      const classLoadingContainer = 'GFartf';
      const classContainerName = 'XCoPyb';
      const loadingContainer = document.querySelector(
        `div[jscontroller="${classLoadingContainer}"]`,
      );
      const buttonsContainer = document.getElementsByClassName(
        classContainerName,
      );
      if (
        !loadingContainer &&
        buttonsContainer.length &&
        buttonsContainer[0].children.length
      ) {
        buttonsContainer[0].children[0]['click']();
        sendResponse({ status: true });
      } else {
        sendResponse({ status: false });
      }
    } else if (request.setEnvironment) {
      const classContainerName = 'VY7JQd';
      const buttonsContainer = document.getElementsByClassName(
        classContainerName,
      );
      if (buttonsContainer.length && buttonsContainer[0].children.length) {
        buttonsContainer[0].children[0]['click']();
        sendResponse({ status: true });
      } else {
        sendResponse({ status: false });
      }
    }
  } catch (e) {
    sendResponse({ status: false });
  }
});
