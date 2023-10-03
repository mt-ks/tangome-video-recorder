chrome.devtools.network.onRequestFinished.addListener(function (
  request
) {
  chrome.devtools.inspectedWindow.eval(
    'console.log(unescape("' + escape(request.request) + '"))'
  );
  request.getContent((body) => {
    if (request.request && request.request.url) {
      if (
        request.request.url.includes(
          'https://proxycador-cdn.tango.me/proxycador/api/public/v1/live/stream/v2/watch'
        )
      ) {
        if (body != null) {
          chrome.runtime.sendMessage({
            message: 'streamInfo',
            data: {
              url: request.request.url,
              body: JSON.parse(body),
            },
          });
        }
      }
      if (
        request.request.url.includes('https://cinema-') &&
        request.request.url.includes('v2/sh/')
      ) {
        chrome.tabs.query(
          { active: true, lastFocusedWindow: true },
          (tabs) => {
            let url = tabs[0].url;
            chrome.runtime.sendMessage({
              message: 'streamVideo',
              data: {
                streamLink: url,
                url: request.request.url,
              },
            });
          }
        );
      }

      if (
        request.request.url.includes(
          'proxycador/api/profiles/v2/single?id='
        )
      ) {
        chrome.tabs.query(
          { active: true, lastFocusedWindow: true },
          (tabs) => {
            let url = tabs[0].url;
            chrome.runtime.sendMessage({
              message: 'userInfo',
              data: {
                streamLink: url,
                url: request.request.url,
                body: JSON.parse(body),
              },
            });
          }
        );
      }
    }
  });
});

chrome.devtools.panels.create(
  'My Panel',
  'MyPanelIcon.png',
  'test.html',
  function (panel) {
    // code invoked on panel creation
  }
);
