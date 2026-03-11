import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('https://cloud.google.com/blog/rss');
    const html = res.data;
    const matches = html.match(/href="[^"]*"/gi);
    if (matches) {
      const rssLinks = matches.filter(m => m.includes('rss') || m.includes('xml'));
      console.log(rssLinks);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
