export default styles => {
  const $link = document.createElement('style');
  $link.innerHTML = styles;
  document.head.appendChild($link);
};
