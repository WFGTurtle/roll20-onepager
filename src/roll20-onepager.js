(async function onePage() {
  try {
    if (window.alreadyRunOnePage) {
      throw new Error('You already ran me on this page!');
    }
    window.alreadyRunOnePage = true;

    const checkPageRe = /https:\/\/app\.roll20\.net\/forum\/post\/\d+?\/[a-zA-Z0-9-]+?\/\?pagenum=(\d+)/i
    if (window.location.href.match(checkPageRe)?.[1] !== '1') {
      throw new Error('You need to be on Page 1 of a Roll20 forum before running me!');
    }

    const postsElement = document.querySelector('.posts');
    if (!postsElement) {
      throw new Error('Couldn\'t find root posts element');
    }

    const pagerElement = document.querySelector('.pagination li:nth-last-child(2) a');
    if (!pagerElement) {
      throw new Error('Couldn\'t find pager element');
    }

    const lastPage = parseInt(pagerElement.href.match(checkPageRe)[1], 10);
    const parser = new DOMParser();
    const requests = [];

    for (let pageNum = 2; pageNum <= lastPage; ++pageNum) {
      requests.push(fetch(`${window.location.pathname}?pagenum=${pageNum}`));
    }

    for (const request of requests) {
      const pageText = await request.then(response => response.text());

      const doc = parser.parseFromString(pageText, 'text/html');

      const allPosts = doc.querySelectorAll('.posts .post');

      for (const post of allPosts) {
        postsElement.append(post);

        // Roll20 does some weird base64 encoding thing for formatted posts
        // Just run the script we get along with the post
        // Live dangerously, eval random javascript!
        const script = post.querySelector('script');
        eval(script.innerHTML);
      }
    }

    // Run Roll20's own timestamp fix script
    $(".timestamp").each(function () {
      if (isNaN($(this).text())) return;
      var time = parseInt($.trim($(this).text()), 10);
      var d = Date.create(time * 1000);
      if (currenttime - d.getTime() > 1000 * 60 * 60 * 24) {
        $(this).text(d.format('{Month} {dd}') + " (" + d.relative() + ")");
      }
      else {
        $(this).text(d.format('{h}:{mm}{TT}') + " (" + d.relative() + ")");
      }
    });

    alert('Done! All posts should now be on this page :)')
  } catch (e) {
    alert(e);
  }
})();
