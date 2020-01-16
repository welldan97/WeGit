export default async (src, ch) =>
  new Promise(resolve => {
    const $script = document.createElement('script');
    $script.setAttribute('src', src);
    document.body.appendChild($script);
    $script.addEventListener('load', () => resolve());
  });
