export default async src =>
  new Promise(resolve => {
    const $script = document.createElement('script');
    $script.setAttribute('src', src);
    document.body.appendChild($script);
    $script.addEventListener('load', () => resolve());
  });
